import { validateDto, validateDtoSync, ValidationError } from "../src/validator"
import { UserDto, ProductDto } from "./fixtures/test-dtos"

describe("Integration Tests", () => {
  describe("Real-world usage scenarios", () => {
    it("should work in a service-like context", async () => {
      // Simulate data from an API request
      const apiData = {
        name: "John Doe",
        email: "john@example.com",
        age: "30", // String that should be converted to number
        bio: "Developer",
      }

      const validatedUser = await validateDto(UserDto, apiData)

      expect(validatedUser).toBeInstanceOf(UserDto)
      expect(typeof validatedUser.age).toBe("number")
      expect(validatedUser.age).toBe(30)
    })

    it("should work in a CLI script context", () => {
      // Simulate command line arguments or config file data
      const cliData = {
        name: "  Product from CLI  ",
        price: "99.99",
        isActive: "true",
        tags: ["cli", "product"],
      }

      const validatedProduct = validateDtoSync(ProductDto, cliData)

      expect(validatedProduct.name).toBe("Product from CLI")
      expect(validatedProduct.price).toBe(99.99)
      expect(validatedProduct.isActive).toBe(true)
    })

    it("should work in a queue processing context", async () => {
      // Simulate message from a queue
      const queueMessage = {
        name: "Queue User",
        email: "queue@example.com",
        age: 25,
      }

      try {
        const validatedUser = await validateDto(UserDto, queueMessage)
        expect(validatedUser.name).toBe("Queue User")
      } catch (error) {
        // Handle validation errors in queue processing
        if (error instanceof ValidationError) {
          console.error("Queue message validation failed:", error.getFormattedMessage())
          throw error
        }
      }
    })

    it("should handle batch validation", async () => {
      const batchData = [
        { name: "User 1", email: "user1@example.com", age: 25 },
        { name: "User 2", email: "user2@example.com", age: 30 },
        { name: "", email: "invalid-email", age: -5 }, // Invalid user
      ]

      const results = await Promise.allSettled(batchData.map((data) => validateDto(UserDto, data)))

      expect(results[0].status).toBe("fulfilled")
      expect(results[1].status).toBe("fulfilled")
      expect(results[2].status).toBe("rejected")

      if (results[2].status === "rejected") {
        expect(results[2].reason).toBeInstanceOf(ValidationError)
      }
    })

    it("should provide detailed error information for debugging", async () => {
      const invalidData = {
        name: "A", // Too short
        email: "not-an-email",
        age: 200, // Too old
      }

      try {
        await validateDto(UserDto, invalidData)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)

        // Check that we can extract specific field errors
        const nameErrors = error.getFieldErrors("name")
        const emailErrors = error.getFieldErrors("email")
        const ageErrors = error.getFieldErrors("age")

        expect(nameErrors.length).toBeGreaterThan(0)
        expect(emailErrors.length).toBeGreaterThan(0)
        expect(ageErrors.length).toBeGreaterThan(0)

        // Check that we can get a formatted message for logging
        const formattedMessage = error.getFormattedMessage()
        expect(formattedMessage).toContain("name")
        expect(formattedMessage).toContain("email")
        expect(formattedMessage).toContain("age")

        // Check that we can serialize for logging/monitoring
        const serialized = error.toJSON()
        expect(serialized.errors).toBeDefined()
        expect(serialized.timestamp).toBeDefined()
      }
    })
  })

  describe("Performance considerations", () => {
    it("should handle large objects efficiently", async () => {
      const largeObject = {
        name: "Performance Test User",
        email: "perf@example.com",
        age: 30,
        bio: "A".repeat(1000), // Large bio field
      }

      const startTime = Date.now()
      const result = await validateDto(UserDto, largeObject)
      const endTime = Date.now()

      expect(result).toBeInstanceOf(UserDto)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
    })

    it("should handle multiple validations efficiently", async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
      }))

      const startTime = Date.now()
      const results = await Promise.all(testData.map((data) => validateDto(UserDto, data)))
      const endTime = Date.now()

      expect(results).toHaveLength(100)
      expect(results.every((result) => result instanceof UserDto)).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})
