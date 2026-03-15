const BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = {
    async uploadPhotoKey(payload) {
        try {
            const results = [];
            for (const workbook of payload.workbooks) {
                // preview.js에서 workbook.Config에 설정을 담아 보냄
                const config = workbook.Config;
                
                const singleUpload = {
                    process_plan: payload.hierarchy.processPlan,
                    beol_option: payload.hierarchy.beolOption,
                    partid: payload.hierarchy.partId,
                    product_name: payload.hierarchy.productName,
                    rfg_category: config.rfgCategory,
                    photo_category: config.photoCategory,
                    is_reference: config.isReference,
                    table_name: config.tableName,
                    rev_no: parseInt(config.revNo),
                    workbook_data: workbook, // 정제된 workbook 객체 (Meta, Config, Worksheets)
                    filename: workbook.Meta.FileName,
                    updater: 'admin_user'
                };

                const response = await fetch(`${BASE_URL}/photo-keys/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(singleUpload)
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Upload failed');
                }
                results.push(await response.json());
            }
            return results;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getProducts() {
        const response = await fetch(`${BASE_URL}/products/`);
        return await response.json();
    }
};

window.apiClient = apiClient;