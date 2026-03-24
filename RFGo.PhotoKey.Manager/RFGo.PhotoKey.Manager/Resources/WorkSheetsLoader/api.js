const getBaseUrl = async () => {
    return await window.chrome.webview.hostObjects.bridge.GetBaseUrl();
};

const apiClient = {
    async uploadPhotoKey(payload) {
        try {
            const baseUrl = await getBaseUrl();
            const response = await fetch(`${baseUrl}/photo-keys/upload-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Upload failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getProducts() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/`);
        return await response.json();
    },

    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/hierarchy`);
        return await response.json();
    },

    async getRestoreData(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/${keyId}`);
        return await response.json();
    },

    async getNextRevision(partid, tableName) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/next-rev/${partid}/${encodeURIComponent(tableName)}`);
        if (!response.ok) return { next_rev: 1 };
        return await response.json();
    },

    async checkExistence(partid, tableName, revNo) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/exists/${partid}/${encodeURIComponent(tableName)}/${revNo}`);
        if (!response.ok) return { exists: false };
        return await response.json();
    }
};

window.apiClient = apiClient;
