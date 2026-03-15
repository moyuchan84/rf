const BASE_URL = 'http://localhost:8080/api/v1/products';

const masterDataApi = {
    async getHierarchy() {
        const response = await fetch(`${BASE_URL}/hierarchy`);
        return await response.json();
    },

    // Process Plan
    async createProcessPlan(data) {
        const response = await fetch(`${BASE_URL}/process-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateProcessPlan(id, data) {
        const response = await fetch(`${BASE_URL}/process-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteProcessPlan(id) {
        await fetch(`${BASE_URL}/process-plans/${id}`, { method: 'DELETE' });
    },

    // BEOL Option
    async createBEOLOption(data) {
        const response = await fetch(`${BASE_URL}/beol-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateBEOLOption(id, data) {
        const response = await fetch(`${BASE_URL}/beol-options/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteBEOLOption(id) {
        await fetch(`${BASE_URL}/beol-options/${id}`, { method: 'DELETE' });
    },

    // Product
    async createProduct(data) {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateProduct(id, data) {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteProduct(id) {
        await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    }
};

window.masterDataApi = masterDataApi;