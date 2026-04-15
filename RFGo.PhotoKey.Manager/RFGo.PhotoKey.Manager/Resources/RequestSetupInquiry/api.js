const getBaseUrl = async () => {
    return await window.chrome.webview.hostObjects.bridge.GetBaseUrl();
};

const apiClient = {
    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/hierarchy`);
        if (!response.ok) throw new Error('Failed to fetch hierarchy');
        return await response.json();
    },

    async getRequestsByProduct(productId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/requests/?product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch requests');
        return await response.json();
    },

    async getRequestReferences(requestId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/requests/${requestId}/references`);
        if (!response.ok) throw new Error('Failed to fetch references');
        return await response.json();
    },

    async getPhotoKeyDetail(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/${keyId}`);
        if (!response.ok) throw new Error('Failed to fetch photo key detail');
        const data = await response.json();
        // Ensure workbook_data is an object
        if (data && typeof data.workbook_data === 'string') {
            try { data.workbook_data = JSON.parse(data.workbook_data); } catch(e) {}
        }
        return data;
    },

    async getRestoreData(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/restore/${keyId}`);
        if (!response.ok) throw new Error('Failed to fetch restore data');
        const data = await response.json();
        // This endpoint returns JUST the workbook_data object
        return typeof data === 'string' ? JSON.parse(data) : data;
    }
};

window.apiClient = apiClient;
