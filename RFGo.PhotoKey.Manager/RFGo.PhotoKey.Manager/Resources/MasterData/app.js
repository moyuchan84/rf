const { createApp, ref, reactive, onMounted } = Vue;

createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedNode = ref(null);
        const processGroups = ref([]);
        const beols = ref([]);
        const isManualBeol = ref(false);
        const loadingLookups = ref(false);
        
        const formState = reactive({
            active: false,
            mode: 'edit', // 'create' or 'edit'
            type: 'plan', // 'plan', 'group', 'option', 'product'
            path: null,
            parentId: null
        });

        const formModel = reactive({
            id: null,
            design_rule: '',
            group_name: '',
            option_name: '',
            partid: '',
            product_name: '',
            meta_info: {
                process_id: '',
                customer: '',
                application: '',
                chip_size_x: 0,
                chip_size_y: 0,
                sl_size_x: 0,
                sl_size_y: 0
            }
        });

        const fetchHierarchy = async () => {
            try {
                const data = await masterDataApi.getHierarchy();
                // data is ProcessPlan -> beol_groups -> beol_options
                // Flatten to ProcessPlan -> beol_options for MasterData display
                hierarchy.value = (data || []).map(pp => ({
                    ...pp,
                    expanded: pp.expanded || false,
                    beol_options: (pp.beol_groups || []).flatMap(bg => 
                        (bg.beol_options || []).map(bo => ({
                            ...bo,
                            expanded: bo.expanded || false,
                            group_name: bg.group_name // Keep group name for reference
                        }))
                    )
                }));
            } catch (err) {
                console.error('Failed to fetch hierarchy:', err);
            }
        };

        const loadLookups = async () => {
            loadingLookups.value = true;
            try {
                if (formState.type === 'plan' && formState.mode === 'create') {
                    const groups = await masterDataApi.getProcessGroups();
                    const existing = new Set(hierarchy.value.map(p => p.design_rule));
                    processGroups.value = groups.filter(g => !existing.has(g));
                }
                if (formState.type === 'option' && formState.mode === 'create') {
                    // Use the design rule of the parent plan
                    const parentRule = formState.path[0];
                    const items = await masterDataApi.getBeols(parentRule);
                    
                    // Filter out already existing options under this plan
                    const parentPlan = hierarchy.value.find(p => p.id === formState.parentId);
                    const existingOptions = new Set(parentPlan?.beol_options.map(o => o.option_name) || []);
                    beols.value = items.filter(bo => !existingOptions.has(bo));
                }
            } catch (err) { console.error('Lookup failed', err); }
            finally { loadingLookups.value = false; }
        };

        const selectNode = (type, data, p1, p2) => {
            selectedNode.value = { type, id: data.id, data };
            formState.active = true;
            formState.mode = 'edit';
            formState.type = type;
            formState.parentId = null;
            isManualBeol.value = false;

            // Set Breadcrumb Path: Plan -> Option -> Product
            if (type === 'plan') formState.path = [data.design_rule];
            if (type === 'option') formState.path = [p1.design_rule, data.option_name];
            if (type === 'product') formState.path = [p1.design_rule, p2.option_name, data.partid];

            // Reset Model
            Object.assign(formModel, {
                id: data.id,
                design_rule: data.design_rule || '',
                group_name: data.group_name || '', // Note: group_name might be internal now
                option_name: data.option_name || '',
                partid: data.partid || '',
                product_name: data.product_name || '',
                meta_info: {
                    process_id: data.meta_info?.process_id || '',
                    customer: data.meta_info?.customer || '',
                    application: data.meta_info?.application || '',
                    chip_size_x: data.meta_info?.chip_size_x || 0,
                    chip_size_y: data.meta_info?.chip_size_y || 0,
                    sl_size_x: data.meta_info?.sl_size_x || 0,
                    sl_size_y: data.meta_info?.sl_size_y || 0
                }
            });
        };

        const startCreate = async (type, parentNode) => {
            const pathBefore = formState.path ? [...formState.path] : [];

            formState.active = true;
            formState.mode = 'create';
            formState.type = type;
            formState.parentId = parentNode ? parentNode.id : null;
            isManualBeol.value = false;
            
            // Set Path for new item
            if (type === 'plan') {
                formState.path = ['Root', 'New Plan'];
            } else if (type === 'option') {
                formState.path = [parentNode.design_rule, 'New Option'];
            } else if (type === 'product') {
                formState.path = [pathBefore[0], parentNode.option_name, 'New Product'];
            }

            // Clear Model
            Object.assign(formModel, {
                id: null,
                design_rule: '',
                group_name: '',
                option_name: '',
                partid: '',
                product_name: '',
                meta_info: {
                    process_id: '',
                    customer: '',
                    application: '',
                    chip_size_x: 0,
                    chip_size_y: 0,
                    sl_size_x: 0,
                    sl_size_y: 0
                }
            });

            await loadLookups();
        };

        const addChild = () => {
            if (formState.type === 'plan') {
                startCreate('option', selectedNode.value.data);
            } else if (formState.type === 'option') {
                startCreate('product', selectedNode.value.data);
            }
        };

        const saveForm = async () => {
            try {
                // Process Meta Info numbers
                const processedMeta = {
                    ...formModel.meta_info,
                    chip_size_x: parseFloat(formModel.meta_info.chip_size_x) || 0,
                    chip_size_y: parseFloat(formModel.meta_info.chip_size_y) || 0,
                    sl_size_x: parseFloat(formModel.meta_info.sl_size_x) || 0,
                    sl_size_y: parseFloat(formModel.meta_info.sl_size_y) || 0
                };

                if (formState.mode === 'create') {
                    if (formState.type === 'plan') await masterDataApi.createProcessPlan({ design_rule: formModel.design_rule });
                    if (formState.type === 'option') await masterDataApi.createBEOLOption({ process_plan_id: formState.parentId, option_name: formModel.option_name });
                    if (formState.type === 'product') {
                        await masterDataApi.createProduct({ 
                            beol_option_id: formState.parentId, 
                            partid: formModel.partid, 
                            product_name: formModel.product_name,
                            meta_info: processedMeta
                        });
                    }
                } else {
                    if (formState.type === 'plan') await masterDataApi.updateProcessPlan(formModel.id, { design_rule: formModel.design_rule });
                    if (formState.type === 'option') await masterDataApi.updateBEOLOption(formModel.id, { option_name: formModel.option_name });
                    if (formState.type === 'product') {
                        await masterDataApi.updateProduct(formModel.id, { 
                            partid: formModel.partid, 
                            product_name: formModel.product_name,
                            meta_info: processedMeta
                        });
                    }
                }
                
                await fetchHierarchy();
                formState.active = false;
                alert('Saved successfully.');
            } catch (err) {
                alert('Save failed: ' + err.message);
            }
        };

        const deleteItem = async () => {
            if (!confirm('Are you sure you want to delete this item? Child items will also be affected.')) return;
            try {
                if (formState.type === 'plan') await masterDataApi.deleteProcessPlan(formModel.id);
                if (formState.type === 'option') await masterDataApi.deleteBEOLOption(formModel.id);
                if (formState.type === 'product') await masterDataApi.deleteProduct(formModel.id);
                
                await fetchHierarchy();
                formState.active = false;
                selectedNode.value = null;
                alert('Deleted successfully.');
            } catch (err) {
                alert('Delete failed: ' + err.message);
            }
        };

        onMounted(fetchHierarchy);

        return {
            hierarchy, selectedNode, formState, formModel,
            processGroups, beols, isManualBeol, loadingLookups,
            fetchHierarchy, selectNode, startCreate, addChild, saveForm, deleteItem
        };
    }
}).mount('#app');
