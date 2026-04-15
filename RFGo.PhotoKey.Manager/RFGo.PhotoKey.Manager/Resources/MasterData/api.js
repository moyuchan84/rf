const getBaseUrl = async () => {
    const bridge = window.chrome?.webview?.hostObjects?.bridge;
    if (!bridge) return "http://localhost:9999/api/v1/products"; // Fallback for dev
    const root = await bridge.GetBaseUrl();
    // If root is something like "http://localhost:9999/api/v1", append /products
    return root.endsWith('/products') ? root : `${root}/products`;
};

const masterDataApi = {
    async getHierarchy() {
        try {
            const baseUrl = await getBaseUrl();
            const response = await fetch(`${baseUrl}/hierarchy`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error("getHierarchy failed", e);
            return [];
        }
    },

    // Process Plan
    async createProcessPlan(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/process-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async updateProcessPlan(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/process-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async deleteProcessPlan(id) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/process-plans/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await response.text());
    },

    // BEOL Option
    async createBEOLOption(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/beol-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async updateBEOLOption(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/beol-options/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async deleteBEOLOption(id) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/beol-options/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await response.text());
    },

    // Product
    async createProduct(data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async updateProduct(id, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },
    async deleteProduct(id) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await response.text());
    },

    // Lookups (from FastAPI using N7MaskBeol)
    async getProcessGroups() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/unique-process-groups`);
        if (!response.ok) return [];
        return await response.json();
    },
    async getBeols(processGrp) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/unique-beols?process_grp=${encodeURIComponent(processGrp)}`);
        if (!response.ok) return [];
        return await response.json();
    }
};

window.masterDataApi = masterDataApi;
