export const fixture = {
  schema_version:'research-ecosystem/v1', catalog_owner:'Game Program Atlas', generated_at:'2026-10-12T00:00:00Z', catalog_generated_at:'2026-09-17T00:00:00Z',
  organizations:[{id:'org:sample',name:'Example University',type:'university',country:'Finland',root_id:'org:sample'}],
  programs:[{id:'program:sample',name:'Game Research PhD',degree_level:'phd',organization_ids:['org:sample'],official_url:'https://example.edu/phd'}],
  centres:[
    {id:'centre:org:lab',organization_id:'org:lab',host_organization_id:'org:sample',name:'Example Game Lab',host_label:'Example University',country:'Finland',topics:['game_studies'],identity_status:'verified',source_url:'https://example.edu/lab',verified_at:'2026-10-09T00:00:00Z'},
    {id:'centre:org:planned',organization_id:'org:planned',host_organization_id:null,name:'Planned Games Centre',host_label:'Host pending',country:'Canada',topics:['HCI'],identity_status:'planned',source_url:'https://example.edu/planned',verified_at:'2026-10-09T00:00:00Z'},
    {id:'centre:org:history',organization_id:'org:history',host_organization_id:null,name:'Historical Games Group',host_label:'Host pending',country:'Canada',topics:['game_studies'],identity_status:'historical',source_url:'https://example.edu/history',verified_at:'2026-10-09T00:00:00Z'},
  ],
};
