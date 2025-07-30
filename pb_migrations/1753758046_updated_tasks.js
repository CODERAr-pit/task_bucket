/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.user.role = \"4th_year\" || \nassigned_to ?= @request.auth.id || \n(is_general = true && domain = @request.auth.user.domain)\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
})
