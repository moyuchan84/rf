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
        return await response.json();
    }
};

window.apiClient = apiClient;
