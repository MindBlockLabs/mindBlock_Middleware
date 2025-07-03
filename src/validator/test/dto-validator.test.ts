import { validateDto, validateDtoSync, ValidationError } from "../src/validator"
import { UserDto, AddressDto, UserWithAddressDto, ProductDto } from "./fixtures/test-dtos"

describe("DtoValidator", () => {
  describe("validateDto (async)", () => {
    it("should validate a valid DTO successfully", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        bio: "Software developer",
      }

      const result = await validateDto(UserDto, plainObject)

      expect(result).toBeInstanceOf(UserDto)
      expect(result.name).toBe("John Doe")
      expect(result.email).toBe("john@example.com")
      expect(result.age).toBe(30)
      expect(result.bio).toBe("Software developer")
    })

    it("should validate a DTO with optional fields", async () => {
      const plainObject = {
        name: "Jane Doe",
        email: "jane@example.com",
        age: 25,
      }

      const result = await validateDto(UserDto, plainObject)

      expect(result).toBeInstanceOf(UserDto)
      expect(result.name).toBe("Jane Doe")
      expect(result.bio).toBeUndefined()
    })

    it("should throw ValidationError for invalid DTO", async () => {
      const plainObject = {
        name: "", // Invalid: empty string
        email: "invalid-email", // Invalid: not an email
        age: -5, // Invalid: negative age
      }

      await expect(validateDto(UserDto, plainObject)).rejects.toThrow(ValidationError)

      try {
        await validateDto(UserDto, plainObject)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.errors).toHaveLength(3)
        expect(error.hasFieldError("name")).toBe(true)
        expect(error.hasFieldError("email")).toBe(true)
        expect(error.hasFieldError("age")).toBe(true)
      }
    })

    it("should validate nested DTOs", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          zipCode: "10001",
        },
      }

      const result = await validateDto(UserWithAddressDto, plainObject)

      expect(result).toBeInstanceOf(UserWithAddressDto)
      expect(result.address).toBeInstanceOf(AddressDto)
      expect(result.address.street).toBe("123 Main St")
    })

    it("should validate arrays of nested DTOs", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          zipCode: "10001",
        },
        additionalAddresses: [
          {
            street: "456 Oak Ave",
            city: "Boston",
            zipCode: "02101",
          },
        ],
      }

      const result = await validateDto(UserWithAddressDto, plainObject)

      expect(result.additionalAddresses).toHaveLength(1)
      expect(result.additionalAddresses![0]).toBeInstanceOf(AddressDto)
    })

    it("should handle transformation", async () => {
      const plainObject = {
        name: "  Product Name  ", // Will be trimmed
        price: "29.99", // Will be converted to number
        isActive: "true", // Will be converted to boolean
        tags: ["tag1", "tag2"],
      }

      const result = await validateDto(ProductDto, plainObject)

      expect(result.name).toBe("Product Name")
      expect(result.price).toBe(29.99)
      expect(typeof result.price).toBe("number")
      expect(result.isActive).toBe(true)
      expect(typeof result.isActive).toBe("boolean")
    })

    it("should throw ValidationError for nested validation failures", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "", // Invalid: empty
          city: "New York",
          zipCode: "123", // Invalid: too short
        },
      }

      await expect(validateDto(UserWithAddressDto, plainObject)).rejects.toThrow(ValidationError)

      try {
        await validateDto(UserWithAddressDto, plainObject)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.hasFieldError("address.street")).toBe(true)
        expect(error.hasFieldError("address.zipCode")).toBe(true)
      }
    })
  })

  describe("validateDtoSync (synchronous)", () => {
    it("should validate a valid DTO successfully", () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      }

      const result = validateDtoSync(UserDto, plainObject)

      expect(result).toBeInstanceOf(UserDto)
      expect(result.name).toBe("John Doe")
      expect(result.email).toBe("john@example.com")
      expect(result.age).toBe(30)
    })

    it("should throw ValidationError for invalid DTO", () => {
      const plainObject = {
        name: "A", // Invalid: too short
        email: "invalid-email",
        age: 150, // Invalid: too old
      }

      expect(() => validateDtoSync(UserDto, plainObject)).toThrow(ValidationError)

      try {
        validateDtoSync(UserDto, plainObject)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.errors.length).toBeGreaterThan(0)
      }
    })

    it("should handle transformation in sync mode", () => {
      const plainObject = {
        name: "  Sync Product  ",
        price: "19.99",
        isActive: "false",
      }

      const result = validateDtoSync(ProductDto, plainObject)

      expect(result.name).toBe("Sync Product")
      expect(result.price).toBe(19.99)
      expect(result.isActive).toBe(false)
    })
  })

  describe("ValidationError", () => {
    it("should provide structured error information", async () => {
      const plainObject = {
        name: "",
        email: "invalid",
        age: -1,
      }

      try {
        await validateDto(UserDto, plainObject)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.dtoClass).toBe("UserDto")
        expect(error.timestamp).toBeInstanceOf(Date)

        const formattedMessage = error.getFormattedMessage()
        expect(formattedMessage).toContain("UserDto")

        const nameErrors = error.getFieldErrors("name")
        expect(nameErrors.length).toBeGreaterThan(0)

        const errorFields = error.getErrorFields()
        expect(errorFields).toContain("name")
        expect(errorFields).toContain("email")
        expect(errorFields).toContain("age")

        const jsonError = error.toJSON()
        expect(jsonError.name).toBe("ValidationError")
        expect(jsonError.errors).toBeDefined()
      }
    })

    it("should handle unknown field errors gracefully", async () => {
      try {
        await validateDto(UserDto, {})
      } catch (error) {
        expect(error.getFieldErrors("nonexistent")).toEqual([])
        expect(error.hasFieldError("nonexistent")).toBe(false)
      }
    })
  })

  describe("Validator Options", () => {
    it("should respect skipMissingProperties option", async () => {
      const plainObject = {
        name: "John Doe",
        // Missing email and age
      }

      const result = await validateDto(UserDto, plainObject, {
        skipMissingProperties: true,
      })

      expect(result.name).toBe("John Doe")
    })

    it("should respect whitelist option", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        extraField: "should be removed", // This should be filtered out
      }

      const result = await validateDto(UserDto, plainObject, {
        whitelist: true,
      })

      expect(result.name).toBe("John Doe")
      expect((result as any).extraField).toBeUndefined()
    })

    it("should handle forbidNonWhitelisted option", async () => {
      const plainObject = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        extraField: "forbidden",
      }

      await expect(
        validateDto(UserDto, plainObject, {
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      ).rejects.toThrow(ValidationError)
    })
  })

  describe("Edge Cases", () => {
    it("should handle null input", async () => {
      await expect(validateDto(UserDto, null)).rejects.toThrow(ValidationError)
    })

    it("should handle undefined input", async () => {
      await expect(validateDto(UserDto, undefined)).rejects.toThrow(ValidationError)
    })

    it("should handle empty object", async () => {
      await expect(validateDto(UserDto, {})).rejects.toThrow(ValidationError)
    })

    it("should handle non-object input", async () => {
      await expect(validateDto(UserDto, "not an object")).rejects.toThrow(ValidationError)
    })
  })
})
