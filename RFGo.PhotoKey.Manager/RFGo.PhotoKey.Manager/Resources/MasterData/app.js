const { createApp, ref, reactive, onMounted } = Vue;

createApp({
    setup() {
        const hierarchy = ref([]);
        const selectedNode = ref(null);
        
        const formState = reactive({
            active: false,
            mode: 'edit', // 'create' or 'edit'
            type: 'plan', // 'plan', 'option', 'product'
            path: null,
            parentId: null
        });

        const formModel = reactive({
            id: null,
            design_rule: '',
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
                hierarchy.value = data.map(pp => ({
                    ...pp,
                    expanded: pp.expanded || false,
                    beol_options: pp.beol_options.map(bo => ({
                        ...bo,
                        expanded: bo.expanded || false
                    }))
                }));
            } catch (err) {
                console.error('Failed to fetch hierarchy:', err);
            }
        };

        const selectNode = (type, data, parent1, parent2) => {
            selectedNode.value = { type, id: data.id, data };
            formState.active = true;
            formState.mode = 'edit';
            formState.type = type;
            formState.parentId = null;

            // Set Breadcrumb Path
            if (type === 'plan') formState.path = [data.design_rule];
            if (type === 'option') formState.path = [parent1.design_rule, data.option_name];
            if (type === 'product') formState.path = [parent1.design_rule, parent2.option_name, data.partid];

            // Reset Model
            Object.assign(formModel, {
                id: data.id,
                design_rule: data.design_rule || '',
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

        const startCreate = (type, parentNode) => {
            const pathBefore = formState.path ? [...formState.path] : [];

            formState.active = true;
            formState.mode = 'create';
            formState.type = type;
            formState.parentId = parentNode ? parentNode.id : null;
            
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
            fetchHierarchy, selectNode, startCreate, addChild, saveForm, deleteItem
        };
    }
}).mount('#app');
