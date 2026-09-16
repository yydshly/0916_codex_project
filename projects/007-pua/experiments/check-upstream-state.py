"""Probe the unmodified upstream runtime-state.py with isolated temporary state."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile

PROJECT = Path(__file__).resolve().parents[1]
REPOSITORY = PROJECT.parents[1]
UPSTREAM = REPOSITORY / 'upstream' / 'pua'
EXPECTED_COMMIT = 'e6e6cd237ad17750d179674bff52f8184abea8fd'

def main():
    commit = subprocess.check_output(['git', '-C', str(UPSTREAM), 'rev-parse', 'HEAD'], text=True).strip()
    if commit != EXPECTED_COMMIT:
        raise RuntimeError('上游版本不匹配，先检出研究固定提交')
    checks = []
    with tempfile.TemporaryDirectory(prefix='pua-state-research-') as directory:
        root = Path(directory)
        workspace = root / 'workspace'
        workspace.mkdir()
        base = dict(session_id='research-session', cwd=str(workspace), tool_name='Bash', hook_event_name='PostToolUse', tool_use_id='event-1', tool_response={'exit_code': 1})
        def call(operation, patch=None):
            payload = dict(base)
            payload.update(patch or {})
            process = subprocess.run([sys.executable, str(UPSTREAM / 'hooks/runtime-state.py'), operation, '--home', str(root / 'home'), '--state-dir', str(root / 'state'), '--cwd', payload['cwd']], input=json.dumps(payload), text=True, capture_output=True, check=True)
            fields = process.stdout.strip().split('\t')
            return fields[0], int(fields[1]), int(fields[2])
        def check(label, actual, expected):
            if actual != expected:
                raise AssertionError(f'{label}: {actual!r} != {expected!r}')
            checks.append(dict(check=label, result='passed', observed=list(actual)))
        check('记录首次真实工具失败', call('record'), ('updated',1,0))
        check('同一工具事件去重', call('record'), ('duplicate',1,0))
        check('成功命令不新增失败', call('record', {'tool_use_id':'success','tool_response':{'exit_code':0}}), ('ignored',0,0))
        check('第二次失败仍保留前次计数', call('record', {'tool_use_id':'event-2'}), ('updated',2,1))
        check('缺少事件身份不计数', call('record', {'tool_use_id':None}), ('ignored',0,0))
        check('用户中断不计数', call('record', {'hook_event_name':'PostToolUseFailure','is_interrupt':True,'tool_use_id':'cancel'}), ('ignored',0,0))
        check('保存数字检查点', call('checkpoint', {'hook_event_name':'PreCompact'}), ('saved',2,1))
        check('同一会话同目录恢复', call('restore', {'hook_event_name':'SessionStart'}), ('restored',2,1))
        check('新会话不继承旧检查点', call('restore', {'hook_event_name':'SessionStart','session_id':'new-session'}), ('ignored',0,0))
        check('其他目录不继承旧检查点', call('restore', {'hook_event_name':'SessionStart','cwd':str(root/'other')}), ('ignored',0,0))
        check('清空仅当前作用域', call('clear', {'hook_event_name':'SessionStart','source':'clear'}), ('cleared',0,0))
        check('清空后无法恢复旧检查点', call('restore', {'hook_event_name':'SessionStart'}), ('ignored',0,0))
    report = dict(date='2026-09-17', upstream_commit=commit, component='hooks/runtime-state.py', python=sys.version.split()[0], status='passed', scope='直接运行未修改的上游 Python 状态组件；没有运行完整 Bash 钩子或真实模型', checks=checks)
    (PROJECT/'notes').mkdir(exist_ok=True)
    (PROJECT/'notes/upstream-state-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'PASS: {len(checks)} isolated upstream state probes.')

if __name__ == '__main__':
    main()
