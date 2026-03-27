const { createApp, ref, shallowRef, onMounted, computed, watch, reactive } = Vue;

const app = createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedProduct = ref(null);
        const selectedBO = ref(null);
        const selectedPP = ref(null);
        const photoKeys = ref([]);
        const selectedKeys = ref([]);

        const viewMode = ref('list'); // 'list', 'detail', 'edit'
        const detailWorkbook = shallowRef(null);
        const activeSheet = shallowRef(null);
        const status = ref('READY');
        const activeLog = ref(null);
        const openAfterRestore = ref(true);
        const folderStructure = ref(localStorage.getItem('rfgo_folder_structure') || 'nested');

        const searchQuery = ref('');
        const expandedTables = ref({});

        const editingKey = ref(null);
        const editConfig = reactive({
            rfgCategory: 'common',
            photoCategory: 'key',
            tableName: '',
            revNo: 1,
            isReference: false,
            log: ''
        });

        const targetFolderPath = ref(localStorage.getItem('rfgo_target_path') || '');

        watch(targetFolderPath, (newPath) => {
            localStorage.setItem('rfgo_target_path', newPath);
        });

        watch(folderStructure, (val) => {
            localStorage.setItem('rfgo_folder_structure', val);
        });

        // --- Grouping & Filtering Logic ---
        const nestedHierarchy = computed(() => {
            const query = (searchQuery.value || '').toLowerCase();
            const allKeys = photoKeys.value || [];
            
            const filtered = allKeys.filter(k => 
                (k.table_name || '').toLowerCase().includes(query) ||
                (k.photo_category || '').toLowerCase().includes(query) ||
                (k.filename || '').toLowerCase().includes(query)
            );

            const groups = {};
            filtered.forEach(key => {
                const cat = (key.photo_category || 'UNCLASSIFIED').toUpperCase();
                const name = key.table_name || 'UNKNOWN';
                if (!groups[cat]) groups[cat] = {};
                if (!groups[cat][name]) groups[cat][name] = [];
                groups[cat][name].push(key);
            });

            // Sort versions by rev_no desc
            Object.keys(groups).forEach(cat => {
                Object.keys(groups[cat]).forEach(name => {
                    groups[cat][name].sort((a, b) => (b.rev_no || 0) - (a.rev_no || 0));
                });
            });
            return groups;
        });

        const toggleExpand = (tableName) => {
            expandedTables.value[tableName] = !expandedTables.value[tableName];
        };

        const isKeySelected = (key) => {
            if (!key) return false;
            return selectedKeys.value.some(k => k.id === key.id);
        };

        const toggleKeySelection = (key) => {
            if (!key) return;
            const index = selectedKeys.value.findIndex(k => k.id === key.id);
            if (index > -1) {
                selectedKeys.value.splice(index, 1);
            } else {
                selectedKeys.value.push(key);
            }
        };

        const selectAllRevisions = (tableName, versions) => {
            if (!versions) return;
            const allIn = versions.every(v => isKeySelected(v));
            if (allIn) {
                versions.forEach(v => {
                    const idx = selectedKeys.value.findIndex(k => k.id === v.id);
                    if (idx > -1) selectedKeys.value.splice(idx, 1);
                });
            } else {
                versions.forEach(v => {
                    if (!isKeySelected(v)) selectedKeys.value.push(v);
                });
            }
        };

        const loadHierarchy = async () => {
            status.value = 'LOADING';
            try {
                const data = await apiClient.getHierarchy();
                hierarchy.value = (data || []).map(pp => ({
                    ...pp,
                    expanded: false,
                    beol_options: (pp.beol_options || []).map(bo => ({ ...bo, expanded: false }))
                }));
            } catch (error) {
                console.error('Failed to load hierarchy:', error);
                status.value = 'ERROR';
            } finally {
                if (status.value !== 'ERROR') status.value = 'READY';
            }
        };

        const pickFolder = async () => {
            try {
                const bridge = window.chrome?.webview?.hostObjects?.bridge?.inquiry;
                if (!bridge) return;
                const path = await bridge.SelectFolder();
                if (path) targetFolderPath.value = path;
            } catch (err) { console.error('Folder selection failed:', err); }
        };

        const selectProduct = async (product, bo, pp) => {
            selectedProduct.value = product;
            selectedBO.value = bo;
            selectedPP.value = pp;
            selectedKeys.value = [];
            expandedTables.value = {};
            searchQuery.value = '';
            viewMode.value = 'list';
            await refreshPhotoKeys();
        };

        const refreshPhotoKeys = async () => {
            if (!selectedProduct.value) return;
            status.value = 'LOADING';
            try {
                const data = await apiClient.getPhotoKeysByProduct(selectedProduct.value.id);
                photoKeys.value = data || [];
            } catch (error) {
                photoKeys.value = [];
            } finally {
                status.value = 'READY';
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
            } finally {
                status.value = 'READY';
            }
        };

        const showDetail = async (key) => {
            status.value = 'LOADING';
            try {
                const detail = await apiClient.getPhotoKeyDetail(key.id);
                let wbData = detail.workbook_data;
                if (typeof wbData === 'string') wbData = JSON.parse(wbData);
                wbData._photoKeyId = key.id; 
                wbData._log = detail.log;
                detailWorkbook.value = wbData;
                activeSheet.value = (wbData.Worksheets && wbData.Worksheets.length > 0) ? wbData.Worksheets[0] : null;
                viewMode.value = 'detail';
            } catch (error) {
                alert('Failed to load detail: ' + error.message);
            } finally {
                status.value = 'READY';
            }
        };

        const restoreToExcel = async () => {
            if (selectedKeys.value.length === 0) return;
            if (!targetFolderPath.value) { alert('Please select a folder.'); return; }
            status.value = 'RESTORING';
            await new Promise(r => setTimeout(r, 100));
            try {
                const itemsToRestore = selectedKeys.value.map(key => {
                    const pp = selectedPP.value?.design_rule || "UnknownPP";
                    const bo = selectedBO.value?.option_name || "UnknownBO";
                    const partId = selectedProduct.value?.partid || "UnknownPart";
                    const prodName = selectedProduct.value?.product_name || "";
                    const rev = key.rev_no;
                    const dateStr = new Date(key.update_date).toISOString().split('T')[0].replace(/-/g, '');
                    let targetDir = (folderStructure.value === 'nested') 
                        ? `${targetFolderPath.value}\\RFGO\\${pp}\\${bo}\\${partId}`
                        : `${targetFolderPath.value}\\RFGO\\${pp}_${bo}_${partId}_${prodName}`.replace(/[\\\/:*?"<>|]/g, '_');
                    return {
                        workbookData: key.workbook_data,
                        targetPath: `${targetDir}\\${pp}_${bo}_${partId}_Rev${rev}_${dateStr}.xlsx`
                    };
                });
                const bridge = window.chrome?.webview?.hostObjects?.bridge?.inquiry;
                if (bridge) await bridge.RestoreToExcel(JSON.stringify(itemsToRestore), targetFolderPath.value, openAfterRestore.value);
            } catch (error) { alert('Restore failed: ' + error.message); }
            finally { status.value = 'READY'; }
        };

        onMounted(loadHierarchy);

        return {
            hierarchy, selectedProduct, selectedBO, selectedPP, photoKeys, selectedKeys,
            viewMode, detailWorkbook, activeSheet, targetFolderPath, openAfterRestore, folderStructure,
            status, editingKey, editConfig, searchQuery, expandedTables, nestedHierarchy,
            loadHierarchy, selectProduct, showDetail, refreshPhotoKeys, pickFolder, showLog: (k) => activeLog.value = k, activeLog,
            toggleExpand, isKeySelected, toggleKeySelection, selectAllRevisions, restoreToExcel,
            editPhotoKey, saveEdit, deleteKey
        };
    }
});

app.mount('#app');
