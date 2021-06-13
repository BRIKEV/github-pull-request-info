SELECT
  oo.id as "orgId",
  oo.name as "orgName",
  r.id as "repositoryId",
  r.name as "repositoryName"
FROM info.org_owner oo
LEFT JOIN info.repository r ON oo.id = r.owner_id
