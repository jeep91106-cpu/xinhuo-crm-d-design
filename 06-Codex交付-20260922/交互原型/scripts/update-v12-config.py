from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / 'src/OperationsModule.jsx'
source = path.read_text(encoding='utf-8')
old = "['字段','流程','适用与财务模板','版本与模拟']"
new = "['字段','资质材料','流程','适用与财务模板','版本与模拟']"
if old in source:
    assert source.count(old) == 1
    path.write_text(source.replace(old, new), encoding='utf-8')
else:
    assert new in source

path = root / 'src/Prototype.jsx'
source = path.read_text(encoding='utf-8')
replacements = {
    '来自 PRD V1.0，结合本轮审查补充执行；不是平台接口已接通或上线已验收的声明。': '来自本轮 PRD V1.2：主体与直客一对一、商务按数量申请、媒介逐行办理；外部接口仍为演示边界。',
    '本轮调整：先确定产品再选择适用资料；商务供应商可预选可空，媒介执行前按行确认。': '本轮调整：商务在一页搜索和补全资料，用数量提交开户需求；媒介逐行确认供应商、回填账户 ID，账户名称可空。',
    '新增客户全景与查询口径是本轮推荐设计。正式 PRD 多格式 V1.0 尚未合并全部审查修订；已知来源冲突不能据原型完成直接标为业务定稿。': '本轮 PRD V1.2 已按用户确认更新主体、店铺、直客关系与数量开户流程；本地界面演示与生产接口验收分别记录。',
}
for old, new in replacements.items():
    if old in source:
        assert source.count(old) == 1
        source = source.replace(old, new)
    else:
        assert new in source
path.write_text(source, encoding='utf-8')

path = root / 'package.json'
import json
package = json.loads(path.read_text(encoding='utf-8'))
test = 'tests/opening-attachments.test.mjs'
if test not in package['scripts']['test']:
    package['scripts']['test'] += ' ' + test
path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
