const { createApp, ref, onMounted, computed, watch, reactive } = Vue;

createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedProduct = ref(null);
        const selectedBO = ref(null);
        const selectedPP = ref(null);
        const photoKeys = ref([]);
        const selectedKeys = ref([]);

        const viewMode = ref('list'); // 'list', 'detail', 'edit'
        const detailWorkbook = ref(null);
        const activeSheet = ref(null);
        const status = ref('READY');
        const activeLog = ref(null);
        const openAfterRestore = ref(true);

        // Edit Mode State
        const editingKey = ref(null);
        const editConfig = reactive({
            rfgCategory: 'common',
            photoCategory: 'key',
            tableName: '',
            revNo: 1,
            isReference: false,
            log: ''
        });

        // Folder selection & Persistence
        const targetFolderPath = ref(localStorage.getItem('rfgo_target_path') || '');

        watch(targetFolderPath, (newPath) => {
            localStorage.setItem('rfgo_target_path', newPath);
        });

        const loadHierarchy = async () => {
            console.log('Loading hierarchy...');
            status.value = 'LOADING';
            try {
                const data = await apiClient.getHierarchy();
                console.log('Hierarchy loaded:', data);
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
            console.log('Picking folder...');
            try {
                if (!window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    console.warn('Bridge inquiry object not found');
                    return;
                }
                const path = await window.chrome.webview.hostObjects.bridge.inquiry.SelectFolder();
                if (path) {
                    console.log('Folder selected:', path);
                    targetFolderPath.value = path;
                }
            } catch (err) {
                console.error('Folder selection failed:', err);
            }
        };

        const selectProduct = async (product, bo, pp) => {
            console.log('Selecting product:', product.partid);
            selectedProduct.value = product;
            selectedBO.value = bo;
            selectedPP.value = pp;
            selectedKeys.value = [];
            viewMode.value = 'list';
            status.value = 'LOADING';
            
            await refreshPhotoKeys();
        };

        const refreshPhotoKeys = async () => {
            if (!selectedProduct.value) return;
            status.value = 'LOADING';
            try {
                const data = await apiClient.getPhotoKeysByProduct(selectedProduct.value.id);
                console.log('Photo keys loaded:', data);
                photoKeys.value = data;
                status.value = 'READY';
            } catch (error) {
                console.error('Failed to load photo keys:', error);
                photoKeys.value = [];
                status.value = 'ERROR';
            }
        };

        const editPhotoKey = (key) => {
            editingKey.value = key;
            editConfig.rfgCategory = key.rfg_category || 'common';
            editConfig.photoCategory = key.photo_category || 'key';
            editConfig.tableName = key.table_name || '';
            editConfig.revNo = key.rev_no || 1;
            editConfig.isReference = !!key.is_reference;
            editConfig.log = key.log || '';
            
            viewMode.value = 'edit';
        };

        const saveEdit = async () => {
            if (!editingKey.value) return;
            status.value = 'SAVING';
            try {
                const updateData = {
                    rfg_category: editConfig.rfgCategory,
                    photo_category: editConfig.photoCategory,
                    table_name: editConfig.tableName,
                    rev_no: editConfig.revNo,
                    is_reference: editConfig.isReference,
                    log: editConfig.log
                };

                await apiClient.updatePhotoKey(editingKey.value.id, updateData);
                alert('Successfully updated.');
                await refreshPhotoKeys();
                viewMode.value = 'list';
            } catch (err) {
                alert('Update failed: ' + err.message);
                status.value = 'READY';
            }
        };

        const deleteKey = async (key) => {
            if (!confirm(`Are you sure you want to delete [${key.table_name}] v${key.rev_no}?\nThis action cannot be undone.`)) {
                return;
            }

            status.value = 'DELETING';
            try {
                await apiClient.deletePhotoKey(key.id);
                alert('Successfully deleted.');
                await refreshPhotoKeys();
            } catch (err) {
                alert('Delete failed: ' + err.message);
                status.value = 'READY';
            }
        };

        const showDetail = async (key) => {
            status.value = 'LOADING';
            try {
                const detail = await apiClient.getPhotoKeyDetail(key.id);
                detailWorkbook.value = detail.workbook_data;
                detailWorkbook.value._photoKeyId = key.id; 
                detailWorkbook.value._log = detail.log;
                
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
                        targetFolderPath.value,
                        openAfterRestore.value
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
                        targetFolderPath.value,
                        openAfterRestore.value
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
            openAfterRestore,
            status,
            editingKey,
            editConfig,
            loadHierarchy,
            selectProduct,
            showDetail,
            editPhotoKey,
            saveEdit,
            deleteKey,
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