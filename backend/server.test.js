const request = require("supertest");
const app = require("./server"); // Import your Express app

describe("Backend API Tests", () => {
    test("GET /api/workers should return worker list", async () => {
        const res = await request(app).get("/api/workers");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/workers/register should register a worker", async () => {
        const res = await request(app)
            .post("/api/workers/register")
            .send({
                name: "John Doe",
                employee_id: "12345",
                department: "Engineering",
                contact: "9876543210",
                assigned_area: "Machine Area"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Worker registered successfully!");
    });
});
