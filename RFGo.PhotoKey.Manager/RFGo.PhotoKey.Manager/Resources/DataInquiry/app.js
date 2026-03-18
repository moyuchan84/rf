const { createApp, ref, onMounted, computed, watch } = Vue;

createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedProduct = ref(null);
        const selectedBO = ref(null);
        const selectedPP = ref(null);
        const photoKeys = ref([]);
        const selectedKeys = ref([]);

        const viewMode = ref('list'); // 'list' or 'detail'
        const detailWorkbook = ref(null);
        const activeSheet = ref(null);
        const status = ref('READY');
        const activeLog = ref(null);

        // Folder selection & Persistence
        const targetFolderPath = ref(localStorage.getItem('rfgo_target_path') || '');

        watch(targetFolderPath, (newPath) => {
            localStorage.setItem('rfgo_target_path', newPath);
        });

        const loadHierarchy = async () => {
            status.value = 'LOADING';
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
                status.value = 'READY';
            } catch (error) {
                console.error('Failed to load hierarchy:', error);
                status.value = 'ERROR';
            }
        };

        const pickFolder = async () => {
            try {
                if (!window.chrome?.webview?.hostObjects?.bridge?.inquiry) return;
                const path = await window.chrome.webview.hostObjects.bridge.inquiry.SelectFolder();
                if (path) targetFolderPath.value = path;
            } catch (err) {
                console.error('Folder selection failed:', err);
            }
        };

        const selectProduct = async (product, bo, pp) => {
            selectedProduct.value = product;
            selectedBO.value = bo;
            selectedPP.value = pp;
            selectedKeys.value = [];
            viewMode.value = 'list';
            status.value = 'LOADING';
            
            try {
                const data = await apiClient.getPhotoKeysByProduct(product.id);
                photoKeys.value = data;
                status.value = 'READY';
            } catch (error) {
                console.error('Failed to load photo keys:', error);
                photoKeys.value = [];
                status.value = 'ERROR';
            }
        };

        const showDetail = async (key) => {
            status.value = 'LOADING';
            try {
                const detail = await apiClient.getPhotoKeyDetail(key.id);
                detailWorkbook.value = detail.workbook_data;
                // detail object id mapping for detail mode restore
                detailWorkbook.value._photoKeyId = key.id; 
                detailWorkbook.value._log = detail.log; // Store log in detail object
                
                if (detailWorkbook.value.Worksheets && detailWorkbook.value.Worksheets.length > 0) {
                    activeSheet.value = detailWorkbook.value.Worksheets[0];
                } else {
                    activeSheet.value = null;
                }
                
                viewMode.value = 'detail';
                status.value = 'READY';
            } catch (error) {
                alert('Failed to load detail: ' + error.message);
                status.value = 'ERROR';
            }
        };

        const showLog = (key) => {
            activeLog.value = key;
        };

        const restoreToExcel = async () => {
            if (selectedKeys.value.length === 0) return;
            if (!targetFolderPath.value) { alert('Please select a target folder first.'); return; }

            status.value = 'RESTORING';
            // Allow UI to render status
            await new Promise(r => setTimeout(r, 100));

            try {
                const itemsToRestore = selectedKeys.value.map(key => {
                    const pp = selectedPP.value.design_rule;
                    const bo = selectedBO.value.option_name;
                    const partId = selectedProduct.value.partid;
                    const rev = key.rev_no;
                    const dateStr = new Date(key.update_date).toISOString().split('T')[0].replace(/-/g, '');

                    const targetDir = `${targetFolderPath.value}\\RFGO\\${pp}\\${bo}\\${partId}`;
                    const fileName = `${pp}_${bo}_${partId}_Rev${rev}_${dateStr}.xlsx`;
                    
                    return {
                        workbookData: key.workbook_data,
                        targetPath: `${targetDir}\\${fileName}`
                    };
                });

                if (window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    await window.chrome.webview.hostObjects.bridge.inquiry.RestoreToExcel(
                        JSON.stringify(itemsToRestore),
                        targetFolderPath.value
                    );
                }
                status.value = 'READY';
            } catch (error) {
                alert('Restore failed: ' + error.message);
                status.value = 'ERROR';
            }
        };

        const restoreToExcelFromDetail = async () => {
            if (!detailWorkbook.value || !targetFolderPath.value) { alert('Please select a folder.'); return; }
            
            status.value = 'RESTORING';
            await new Promise(r => setTimeout(r, 100));

            try {
                const pp = selectedPP.value.design_rule;
                const bo = selectedBO.value.option_name;
                const partId = selectedProduct.value.partid;
                
                const currentKey = photoKeys.value.find(k => k.id === detailWorkbook.value._photoKeyId) || { rev_no: 0, update_date: new Date() };
                const rev = currentKey.rev_no;
                const dateStr = new Date(currentKey.update_date).toISOString().split('T')[0].replace(/-/g, '');

                const targetDir = `${targetFolderPath.value}\\RFGO\\${pp}\\${bo}\\${partId}`;
                const fileName = `${pp}_${bo}_${partId}_Rev${rev}_${dateStr}.xlsx`;

                const item = {
                    workbookData: detailWorkbook.value,
                    targetPath: `${targetDir}\\${fileName}`
                };

                if (window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    await window.chrome.webview.hostObjects.bridge.inquiry.RestoreToExcel(
                        JSON.stringify([item]),
                        targetFolderPath.value
                    );
                }
                status.value = 'READY';
            } catch (error) {
                alert('Restore failed: ' + error.message);
                status.value = 'ERROR';
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
            targetFolderPath,
            status,
            loadHierarchy,
            selectProduct,
            showDetail,
            restoreToExcel,
            restoreToExcelFromDetail,
            toggleAll,
            allSelected,
            pickFolder,
            showLog,
            activeLog
        };
    }
}).mount('#app');