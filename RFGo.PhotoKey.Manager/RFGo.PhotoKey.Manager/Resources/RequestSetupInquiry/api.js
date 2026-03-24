const BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = {
    async getHierarchy() {
        const response = await fetch(`${BASE_URL}/products/hierarchy`);
        if (!response.ok) throw new Error('Failed to fetch hierarchy');
        return await response.json();
    },

    async getRequestsByProduct(productId) {
        const response = await fetch(`${BASE_URL}/requests/?product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch requests');
        return await response.json();
    },

    async getRequestReferences(requestId) {
        const response = await fetch(`${BASE_URL}/requests/${requestId}/references`);
        if (!response.ok) throw new Error('Failed to fetch references');
        return await response.json();
    },

    async getPhotoKeyDetail(keyId) {
        const response = await fetch(`${BASE_URL}/photo-keys/${keyId}`);
        if (!response.ok) throw new Error('Failed to fetch photo key detail');
        return await response.json();
    }
};

window.apiClient = apiClient;
