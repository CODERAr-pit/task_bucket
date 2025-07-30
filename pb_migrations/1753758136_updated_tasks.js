/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.user.role != \"1st_year\"\n",
    "updateRule": "@request.auth.user.role = \"4th_year\" || assigned_by = @request.auth.id\n",
    "viewRule": "@request.auth.user.role = \"4th_year\" || \nassigned_to ?= @request.auth.id\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "createRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
