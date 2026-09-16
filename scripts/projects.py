"""Manage the research registry and README using only the standard library."""

import argparse
from datetime import date
import json
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import quote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "projects.json"
STATUSES = {"待研究", "研究中", "已完成", "已归档"}
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def https_url(value):
    if not isinstance(value, str) or re.search(r"[\s<>]", value):
        return False
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username


def project_path(project):
    return f"projects/{project['id']:03d}-{project['slug']}"


def validate(projects):
    require(isinstance(projects, list), "projects 必须为数组")
    ids, slugs = set(), set()
    for project in projects:
        require(isinstance(project, dict), "项目条目必须为对象")
        number, slug = project.get("id"), project.get("slug")
        require(type(number) is int and number > 0, "id 必须为正整数")
        require(number not in ids, f"重复编号：{number}")
        require(isinstance(slug, str) and SLUG.fullmatch(slug), f"无效 slug：{slug}")
        require(slug not in slugs, f"重复 slug：{slug}")
        ids.add(number)
        slugs.add(slug)
        for key in ("name", "summary", "repo", "status", "cover", "cover_alt", "demo"):
            value = project.get(key)
            require(isinstance(value, str) and "\n" not in value and "\r" not in value,
                    f"{number}: {key} 必须为单行字符串")
        require(project["name"].strip() and project["summary"].strip(),
                f"{number}: 名称与摘要不能为空")
        require(project["status"] in STATUSES, f"{number}: 无效状态")
        require(https_url(project["repo"]), f"{number}: 上游地址必须是 HTTPS URL")
        require(not project["demo"] or https_url(project["demo"]),
                f"{number}: 演示地址必须是 HTTPS URL 或空字符串")
        tags = project.get("tags")
        require(isinstance(tags, list) and all(isinstance(tag, str) and tag.strip()
                and "\n" not in tag and "\r" not in tag for tag in tags),
                f"{number}: tags 必须为非空单行字符串数组")
        directory = ROOT / project_path(project)
        require((directory / "README.md").is_file(), f"缺少 {directory}/README.md")
        if project["cover"]:
            cover = (ROOT / project["cover"]).resolve()
            require(cover.is_relative_to((directory / "assets").resolve()),
                    f"{number}: 封面必须位于该子项目 assets 目录内")
            require(cover.is_file(), f"封面不存在：{project['cover']}")
            require(project["cover_alt"].strip(), f"{number}: 封面需要 cover_alt 图片说明")
        guides = project.get("guides", [])
        require(isinstance(guides, list), f"{number}: guides 必须为数组")
        for guide in guides:
            require(isinstance(guide, dict), f"{number}: 引导图必须为对象")
            for key in ("title", "image", "alt"):
                value = guide.get(key)
                require(isinstance(value, str) and value.strip()
                        and "\n" not in value and "\r" not in value,
                        f"{number}: 引导图 {key} 必须为非空单行字符串")
            guide_image = (ROOT / guide["image"]).resolve()
            require(guide_image.is_relative_to((directory / "assets").resolve()),
                    f"{number}: 引导图必须位于该子项目 assets 目录内")
            require(guide_image.is_file(), f"引导图不存在：{guide['image']}")
    return sorted(projects, key=lambda project: project["id"])


def read_projects():
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    require(isinstance(data, dict) and "projects" in data, "清单缺少 projects 字段")
    return validate(data["projects"])


def markdown(value):
    value = value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(r"([\\`*_{}\[\]()#+.!|~-])", r"\\\1", value)


def link_url(value):
    return quote(value, safe="/:?=&%#@+;,")


def repository_name(url):
    parsed = urlsplit(url)
    return parsed.path.strip("/").removesuffix(".git") or parsed.hostname


def render(projects):
    if projects:
        rows = ["| 编号 | 项目 | 研究摘要 | 标签 | 状态 | 上游 | 演示 |",
                "| --- | --- | --- | --- | --- | --- | --- |"]
        for project in projects:
            demo = f"[访问]({link_url(project['demo'])})" if project["demo"] else "—"
            tags = "、".join(project["tags"]) or "—"
            rows.append(
                f"| {project['id']:03d} | [{markdown(project['name'])}]({project_path(project)}/README.md) "
                f"| {markdown(project['summary'])} | {markdown(tags)} | {project['status']} "
                f"| [{markdown(repository_name(project['repo']))}]({link_url(project['repo'])}) | {demo} |")
        index = "\n".join(rows)
    else:
        index = "目前尚未收录项目。首个项目将从 **001** 开始。"

    cards = []
    for project in projects:
        if project["cover"]:
            cards.append(
                f"### {project['id']:03d} · [{markdown(project['name'])}]({project_path(project)}/README.md)\n\n"
                f"{markdown(project['summary'])}\n\n"
                f"![{markdown(project['cover_alt'])}]({link_url(project['cover'])})\n\n"
                f"{markdown(project['cover_alt'])}")
            for guide in project.get("guides", []):
                cards.append(
                    f"#### {markdown(guide['title'])}\n\n"
                    f"![{markdown(guide['alt'])}]({link_url(guide['image'])})\n\n"
                    f"{markdown(guide['alt'])}")
    gallery = "\n\n".join(cards) or "添加子项目截图后，这里会自动展示带说明的预览图。"
    content = (ROOT / "README.md").read_text(encoding="utf-8")
    for section, body in (("INDEX", index), ("GALLERY", gallery)):
        start = f"<!-- PROJECT_{section}:START -->"
        end = f"<!-- PROJECT_{section}:END -->"
        require(content.count(start) == content.count(end) == 1,
                f"README 中的 {section} 标记缺失或重复")
        before, rest = content.split(start)
        require(end in rest, f"README 中的 {section} 标记顺序错误")
        _, after = rest.split(end)
        content = before + start + "\n" + body + "\n" + end + after
    return content


def sync(projects):
    (ROOT / "README.md").write_text(render(projects), encoding="utf-8", newline="\n")


def add(args):
    projects = read_projects()
    require(SLUG.fullmatch(args.slug), "slug 只允许小写字母、数字和连字符")
    require(all(project["slug"] != args.slug for project in projects), "该 slug 已存在")
    require(https_url(args.repo), "上游地址必须是 HTTPS URL")
    require(all(value.strip() and "\n" not in value and "\r" not in value
                for value in (args.name, args.summary)), "名称与摘要必须为非空单行文本")
    render(projects)  # Check README markers before creating files.
    number = max((project["id"] for project in projects), default=0) + 1
    project = dict(id=number, slug=args.slug, name=args.name, summary=args.summary,
                   repo=args.repo, status="待研究", tags=[], cover="", cover_alt="", demo="")
    destination = ROOT / project_path(project)
    require(not destination.exists(), f"目录已存在：{destination}")
    shutil.copytree(ROOT / "templates/project", destination)
    readme = destination / "README.md"
    values = dict(id=f"{number:03d}", name=markdown(args.name), summary=markdown(args.summary),
                  repo=link_url(args.repo), date=date.today().isoformat())
    content = re.sub(r"\{\{(\w+)\}\}", lambda match: values[match[1]],
                     readme.read_text(encoding="utf-8"))
    readme.write_text(content, encoding="utf-8", newline="\n")
    projects.append(project)
    validate(projects)
    REGISTRY.write_text(json.dumps({"projects": projects}, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8", newline="\n")
    sync(projects)
    print(f"已创建 {project_path(project)}，首页已更新。")


def main():
    parser = argparse.ArgumentParser(description="新增研究项目、更新首页并检查索引")
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("add", help="分配编号并创建研究目录")
    create.add_argument("slug")
    create.add_argument("--name", required=True)
    create.add_argument("--repo", required=True)
    create.add_argument("--summary", required=True)
    commands.add_parser("sync", help="从清单更新 README 索引和图片预览")
    commands.add_parser("check", help="检查清单、目录、封面和 README 是否同步")
    args = parser.parse_args()
    if args.command == "add":
        add(args)
        return
    projects = read_projects()
    if args.command == "sync":
        sync(projects)
        print("首页索引与图片预览已更新。")
    else:
        require((ROOT / "README.md").read_text(encoding="utf-8") == render(projects),
                "首页未同步，请运行 python scripts/projects.py sync")
        print(f"检查通过：{len(projects)} 个项目，编号、目录、图片与首页一致。")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as error:
        print(f"错误：{error}", file=sys.stderr)
        sys.exit(1)
