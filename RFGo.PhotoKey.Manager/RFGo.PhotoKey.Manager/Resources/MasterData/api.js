const getBaseUrl = async () => {
    const root = await window.chrome.webview.hostObjects.bridge.GetBaseUrl();
    return `${root}/products`;
};

const masterDataApi = {
    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/hierarchy`);
        return await response.json();
    },

    // Process Plan
    async createProcessPlan(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/process-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateProcessPlan(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/process-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteProcessPlan(id) {
        const baseUrl = await getBaseUrl();
        await fetch(`${baseUrl}/process-plans/${id}`, { method: 'DELETE' });
    },

    // BEOL Option
    async createBEOLOption(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/beol-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateBEOLOption(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/beol-options/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteBEOLOption(id) {
        const baseUrl = await getBaseUrl();
        await fetch(`${baseUrl}/beol-options/${id}`, { method: 'DELETE' });
    },

    // Product
    async createProduct(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async updateProduct(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    async deleteProduct(id) {
        const baseUrl = await getBaseUrl();
        await fetch(`${baseUrl}/products/${id}`, { method: 'DELETE' });
    }
};

window.masterDataApi = masterDataApi;
