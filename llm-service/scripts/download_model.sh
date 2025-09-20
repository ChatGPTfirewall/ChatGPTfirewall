#!/bin/bash

curl http://llm-service:11434/api/pull -d '{
  "name": "smollm2:135m"
}'
