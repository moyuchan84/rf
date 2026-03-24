const getBaseUrl = async () => {
    return await window.chrome.webview.hostObjects.bridge.GetBaseUrl();
};

const getAuthToken = async () => {
    return await window.chrome.webview.hostObjects.bridge.GetAuthToken();
};

const apiClient = {
    async fetchWithAuth(url, options = {}) {
        const token = await getAuthToken();
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        return fetch(url, { ...options, headers });
    },

    async uploadPhotoKey(payload) {
        try {
            const baseUrl = await getBaseUrl();
            
            // Get user info and set as updater
            const userInfoRaw = await window.chrome.webview.hostObjects.bridge.GetUserInfo();
            if (userInfoRaw) {
                const user = JSON.parse(userInfoRaw);
                payload.workbooks.forEach(w => {
                    w.updater = user.UserName || 'Unknown';
                });
            }

            const response = await this.fetchWithAuth(`${baseUrl}/photo-keys/upload-batch`, {
                method: 'POST',
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
        const response = await this.fetchWithAuth(`${baseUrl}/products/`);
        return await response.json();
    },

    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await this.fetchWithAuth(`${baseUrl}/products/hierarchy`);
        return await response.json();
    },

    async getRestoreData(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await this.fetchWithAuth(`${baseUrl}/photo-keys/${keyId}`);
        return await response.json();
    },

    async getNextRevision(partid, tableName) {
        const baseUrl = await getBaseUrl();
        const response = await this.fetchWithAuth(`${baseUrl}/photo-keys/next-rev/${partid}/${encodeURIComponent(tableName)}`);
        if (!response.ok) return { next_rev: 1 };
        return await response.json();
    },

    async checkExistence(partid, tableName, revNo) {
        const baseUrl = await getBaseUrl();
        const response = await this.fetchWithAuth(`${baseUrl}/photo-keys/exists/${partid}/${encodeURIComponent(tableName)}/${revNo}`);
        if (!response.ok) return { exists: false };
        return await response.json();
    }
};

window.apiClient = apiClient;
