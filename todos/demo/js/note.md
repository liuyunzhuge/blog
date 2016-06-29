1. Backbone.Model内置事件：
"change" (model, options) — when a model's attributes have changed.
"change:[attribute]" (model, value, options) — when a specific attribute has been updated.
"destroy" (model, collection, options) — when a model is destroyed.
"request" (model_or_collection, xhr, options) — when a model or collection has started a request to the server.
"sync" (model_or_collection, response, options) — when a model or collection has been successfully synced with the server.
"error" (model_or_collection, response, options) — when a model's or collection's request to the server has failed.
"invalid" (model, error, options) — when a model's validation fails on the client.

