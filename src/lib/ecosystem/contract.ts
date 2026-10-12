export const ecosystemUrl = 'https://playwithexperiences.github.io/Game-Program-Atlas/research-ecosystem.json';
export interface Centre { id: string; organization_id: string; host_organization_id: string | null; name: string; host_label: string; country: string; topics: string[]; identity_status: string; source_url: string; verified_at: string }
export interface Institution { id: string; name: string; type: string; country: string }
export interface Program { id: string; name: string; degree_level: string; organization_ids: string[]; official_url: string }
export interface Ecosystem { schema_version: string; catalog_owner: string; generated_at: string; catalog_generated_at: string; centres: Centre[]; organizations: Institution[]; programs: Program[] }
const centreKeys = 'id organization_id host_organization_id name host_label country topics identity_status source_url verified_at'.split(' ');
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== keys.sort().join('|')) throw new Error('公开数据字段不符合约定');
  return value as Record<string, unknown>;
}
function texts(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) if (typeof row[key] !== 'string' || !(row[key] as string).trim()) throw new Error('公开文本缺失');
}
function strings(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || !v.trim())) throw new Error('公开列表无效');
}
function source(value: unknown) {
  if (typeof value !== 'string') throw new Error('来源缺失');
  const u = new URL(value);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) throw new Error('来源不是公共网页');
}
export function parseEcosystem(value: unknown): Ecosystem {
  const data = record(value, ['schema_version','catalog_owner','generated_at','catalog_generated_at','centres','organizations','programs']);
  if (data.schema_version !== 'research-ecosystem/v1' || data.catalog_owner !== 'Game Program Atlas') throw new Error('公开目录版本不兼容');
  for (const key of ['generated_at','catalog_generated_at']) if (typeof data[key] !== 'string' || !Number.isFinite(Date.parse(data[key] as string))) throw new Error('快照日期无效');
  for (const key of ['centres','organizations','programs']) {
    if (!Array.isArray(data[key]) || !(data[key] as unknown[]).length) throw new Error('公开目录为空，不能当作没有记录');
    const ids = new Set();
    for (const row of data[key] as Record<string,unknown>[]) {
      if (!row || typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error('实体标识缺失或重复');
      ids.add(row.id);
    }
  }
  const ids = new Set((data.organizations as Record<string,unknown>[]).map(r=>r.id));
  for (const value of data.organizations as unknown[]) {
    const row = record(value,['id','name','type','country']); texts(row,['id','name','type']);
    if (typeof row.country !== 'string') throw new Error('地区无效');
  }
  for (const value of data.centres as unknown[]) {
    const row = record(value,centreKeys); texts(row,['id','organization_id','name','host_label','country','identity_status','verified_at']); strings(row.topics); source(row.source_url);
    if (row.id !== `centre:${row.organization_id}` || !['verified','partial','historical','planned','source_unavailable'].includes(row.identity_status as string) || !Number.isFinite(Date.parse(row.verified_at as string))) throw new Error('中心身份或核查日期无效');
    if (row.host_organization_id !== null && !ids.has(row.host_organization_id)) throw new Error('中心关联机构缺失');
  }
  for (const value of data.programs as unknown[]) {
    const row = record(value,['id','name','degree_level','organization_ids','official_url']); texts(row,['id','name','degree_level']); strings(row.organization_ids); source(row.official_url);
    if (!row.organization_ids.length || row.organization_ids.some(id=>!ids.has(id))) throw new Error('项目关联机构缺失');
  }
  return data as unknown as Ecosystem;
}
