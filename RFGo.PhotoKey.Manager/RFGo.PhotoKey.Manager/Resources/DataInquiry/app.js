const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedProduct = ref(null);
        const selectedBO = ref(null);
        const selectedPP = ref(null);
        const photoKeys = ref([]);
        const selectedKeys = ref([]);

        // New state for Detail View integration
        const viewMode = ref('list'); // 'list' or 'detail'
        const detailWorkbook = ref(null);
        const activeSheet = ref(null);

        const loadHierarchy = async () => {
            try {
                const data = await apiClient.getHierarchy();
                hierarchy.value = data.map(pp => ({
                    ...pp,
                    expanded: false,
                    beol_options: pp.beol_options.map(bo => ({
                        ...bo,
                        expanded: false
                    }))
                }));
            } catch (error) {
                console.error('Failed to load hierarchy:', error);
            }
        };

        const selectProduct = async (product, bo, pp) => {
            selectedProduct.value = product;
            selectedBO.value = bo;
            selectedPP.value = pp;
            selectedKeys.value = [];
            viewMode.value = 'list'; // Switch back to list when changing product
            
            try {
                const data = await apiClient.getPhotoKeysByProduct(product.id);
                photoKeys.value = data;
            } catch (error) {
                console.error('Failed to load photo keys:', error);
                photoKeys.value = [];
            }
        };

        const showDetail = async (key) => {
            try {
                const detail = await apiClient.getPhotoKeyDetail(key.id);
                detailWorkbook.value = detail.workbook_data;
                
                if (detailWorkbook.value.Worksheets && detailWorkbook.value.Worksheets.length > 0) {
                    activeSheet.value = detailWorkbook.value.Worksheets[0];
                }
                
                viewMode.value = 'detail';
            } catch (error) {
                alert('Failed to load detail: ' + error.message);
            }
        };

        const restoreToExcel = async () => {
            if (selectedKeys.value.length === 0) return;
            if (!confirm(`Restore ${selectedKeys.value.length} tables to Excel?`)) return;

            try {
                const workbooksToRestore = selectedKeys.value.map(k => k.workbook_data);
                if (window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    await window.chrome.webview.hostObjects.bridge.inquiry.RestoreToExcel(
                        JSON.stringify(workbooksToRestore)
                    );
                }
            } catch (error) {
                alert('Restore failed: ' + error.message);
            }
        };

        const restoreToExcelFromDetail = async () => {
            if (!detailWorkbook.value) return;
            try {
                if (window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    await window.chrome.webview.hostObjects.bridge.inquiry.RestoreToExcel(
                        JSON.stringify([detailWorkbook.value])
                    );
                }
            } catch (error) {
                alert('Restore failed: ' + error.message);
            }
        };

        const toggleAll = (event) => {
            if (event.target.checked) {
                selectedKeys.value = [...photoKeys.value];
            } else {
                selectedKeys.value = [];
            }
        };

        const allSelected = computed(() => {
            return photoKeys.value.length > 0 && selectedKeys.value.length === photoKeys.value.length;
        });

        onMounted(loadHierarchy);

        return {
            hierarchy,
            selectedProduct,
            photoKeys,
            selectedKeys,
            viewMode,
            detailWorkbook,
            activeSheet,
            loadHierarchy,
            selectProduct,
            showDetail,
            restoreToExcel,
            restoreToExcelFromDetail,
            toggleAll,
            allSelected
        };
    }
}).mount('#app');