build: validators/property_funds.ak
	aiken build

.PHONY=watch
watch:
	@find ./ \( -name "*ak" -o -name "*ak" \) | entr $(MAKE)
