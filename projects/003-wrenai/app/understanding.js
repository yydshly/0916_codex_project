// Research judgments, not measured end-to-end accuracy or automatic risk scores.
const scenarios={
  sales:{grade:'优先试点',title:'固定口径的销售与经营问数',input:'订单、客户、付款、退款，以及地区与时间要求。',prepare:'确定净收入、有效订单、退款归属月、币种和客户关联方式。',output:'地区收入、客户排名、订单趋势；SQL、结果表与图表。',check:'与财务或经营报表核对；覆盖跨月退款、内部订单和多表重复计数。本项目只实测了合成销售数据。'},
  operations:{grade:'定义清楚后适合',title:'常规运营与订阅指标报表',input:'行为事件、账户、订阅、账单，以及统计周期。',prepare:'定义活跃、留存、续费、流失和 MRR；明确去重身份及月化方式。',output:'按已定义指标查询活跃趋势、续费与订阅收入；不自动发明指标口径。',check:'使用现有指标平台或人工样题核对分母、窗口和身份去重；重要指标变更需业务确认。'},
  inventory:{grade:'结构化分析适合',title:'库存、周转与履约分析',input:'库存流水、采购、出入库、订单与配送记录。',prepare:'明确可用库存、在途数量、退货、时区和周转天数公式。',output:'缺货列表、库存分布、周转与交付时长分析；执行补货需另接交易流程。',check:'与仓储系统核对时点库存和流水；检查迟到记录、重复同步及跨日边界。'},
  exploration:{grade:'适合辅助，保留复核',title:'分析师探索、留存与复杂指标',input:'业务问题、相关多表数据、分析假设及已有指标。',prepare:'明确数据粒度、时间窗口、归因方式与分析口径；提供正确查询案例。',output:'候选 SQL、探索结果和对比图，帮助分析师减少重复查数。',check:'分析师审核 JOIN、分母和样本范围；复杂财务或归因结论须独立验证，SQL 合法不代表结论成立。'},
  transactions:{grade:'需要额外业务系统',title:'付款、审批与自动下单',input:'交易对象、金额、动作请求，以及业务系统状态。',prepare:'除问数外，还需交易 API、权限、审批、幂等和业务校验流程。',output:'Wren 可提供决策所需的查询证据；实际付款或下单由独立业务流程执行。',check:'问数引擎的成功查询不能证明交易可靠性；关键动作应遵循业务系统的授权与审批规则。'},
  prediction:{grade:'查询提供证据，需额外分析',title:'销量预测、原因判断与经营建议',input:'历史数据、预测目标、外部因素或可检验的原因假设。',prepare:'准备合适的预测或因果分析方法、训练与验证数据、评估口径。',output:'Wren 可提供汇总和对比数据；预测或因果结论需要额外方法支持。',check:'用留出数据评估预测；用合适研究设计支持因果判断。只有当期数字，不能得出增长原因。'}
};
function render(){const item=scenarios[document.getElementById('business-scenario').value];for(const key of ['grade','title','input','prepare','output','check'])document.getElementById(`scenario-${key}`).textContent=item[key];}
document.getElementById('business-scenario').addEventListener('change',render);render();
