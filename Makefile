.PHONY: watch fmt

fmt: build 
	aiken fmt && deno fmt 

build: validators/property_funds.ak
	aiken build --trace-level verbose

watch:
	@find ./ \( -name "*ak" -o -name "*tsx" \) | entr $(MAKE)
