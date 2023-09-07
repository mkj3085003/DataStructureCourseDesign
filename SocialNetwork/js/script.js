$(document).ready(function () {
    $('body').removeClass('fade-out'); // 移除淡出类，启用淡入效果
  });
const app = new Vue({
    el: '#app',
    data: {
        selectedOption: 'Network',
        // 数据管理结点的NodeManager实例
        nodeManager: new NodeManager(),
        // 关系图的数据
        data: {
            nodes: [],
            links: [],
        },
        //结点是否展示文字
        showNodeText: false,
        //用于搜索框
        searchQuery: '', // 初始化搜索框输入为空
        // 控制是否显示个人结点添加表单
        isPersonAddVisible: false,
        // 控制是否显示群组结点添加表单
        isGroupAddVisible: false,
        // 个人结点表单数据
        PersonFormData: {
            name: '',        // 用户姓名
            gender: PersonGender.MALE,     // 默认性别为男性
            groups: [],      // 选择的群组ID
            friends: [],    //选择的好友ID
        },
        GroupFormData: {
            name: '',         // 群组名
            relationCoefficient: 1,   // 关联数，默认为1
            tag: NodeTag.GROUP,  // 类别，默认为其他
        },
        // 控制是否显示编辑个人结点表单
        isPersonEditVisible: false,
        EditedPersonData: {
            id: '', // 编辑的个人结点的ID
            name: '', // 编辑的个人结点的姓名
            gender: PersonGender.MALE, // 编辑的个人结点的性别
            groups: [], // 编辑的个人结点的群组
            friends: [], // 编辑的个人结点的好友
        },
        //临时存储用于编辑对照的关系数组
        editPreviousPersonRelation: {
            groups: [], // 编辑的个人结点的群组
            friends: [], // 编辑的个人结点的好友
        },
        // 控制是否显示编辑群组结点表单
        isGroupEditVisible: false,
        // 用于编辑群组结点的表单数据
        EditedGroupData: {
            name: '',         // 群组名称
            relationCoefficient: 1,   // 关联数，默认为1
            tag: NodeTag.GROUP  // 类别，默认为其他
        },
        //控制是否显示删除个人结点的对话框
        isDeletePersonNodeDialogVisible: false,
        // 正在删除的个人结点
        deletingPersonNode: {
            name: '',        // 用户姓名
            gender: PersonGender.MALE,// 默认性别为男性
            relations: [],      // 选择的群组ID
        },
        isDeleteGroupNodeDialogVisible: false,
        deletingGroupNode: {
            name: '',         // 群组名称
            relationCoefficient: 1,   // 关联数，默认为1
            tag: NodeTag.GROUP  // 类别，默认为其他
        },
        indicatorItems: [
            { name: 'Person_Male', color: 'skyblue' },
            { name: 'Person_Female', color: 'pink' },
            { name: 'Primary_School', color: '#7FFFAA' },
            { name: 'Junior_High', color: '	#FF1493' },
            { name: 'Senior_High', color: '#F08080' },
            { name: 'University', color: '	#9370DB' },
            { name: 'Other_Group', color: 'linear-gradient(to right, skyblue, pink)' }, // 添加渐变颜色
        ],
        //用于推荐好友
        selectedNode: null, // 当前选中的结点
        showRecommendFriends: false, // 是否显示推荐好友窗口
        recommendedFriends: [], // 推荐好友列表

    },
    mounted() {
        // const personNode1 = new PersonNode("John Doe", PersonGender.MALE);
        // this.nodeManager.insert(personNode1);


        // const personNode2 = new PersonNode("Jane Smith", PersonGender.FEMALE); // 女性
        // this.nodeManager.insert(personNode2);

        // const personNode3 = new PersonNode("Bob Johnson", PersonGender.MALE); // 男性
        // this.nodeManager.insert(personNode3);

        // // 添加群组结点
        // const groupNode1 = new GroupNode("Family Group", NodeTag.PRIMARY_SCHOOL, 3);
        // this.nodeManager.insert(groupNode1);

        // const groupNode2 = new GroupNode("Work Group", NodeTag.JUNIOR_HIGH, 5);
        // this.nodeManager.insert(groupNode2);

        // const groupNode3 = new GroupNode("Hobby Group", NodeTag.GROUP, 6);
        // this.nodeManager.insert(groupNode3);
        // personNode1.addRelation(personNode2);
        // personNode1.addRelation(groupNode1);
        // personNode2.addRelation(groupNode1);
        // console.log('Vue实例已初始化');
        this.loadRelationChart(); // 初始加载关系图
    },

    methods: {
        redirectToHome: function () {
            window.location.href = "../index.html";
        },
        changeOption(option) {
            this.selectedOption = option;
        },
        openFileInput() {
            // 当按钮被点击时，触发文件上传元素的点击事件
            document.getElementById("fileInput").click();
        },

        handleFileUpload(event) {
            // 当用户选择文件后，将文件内容读取为字符串并传递给 importDefaultData 函数
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileContent = e.target.result;
                    this.nodeManager.import(fileContent);
                };
                reader.readAsText(selectedFile);
            }

        },
        //文件下载
        convertNodeManagerToJson() {
            const serializedNodes = this.nodeManager.nodes.map((node) => {
                return node.toJsonableObject();
            });

            return {
                nextId: this.nodeManager.nextId,
                nodes: serializedNodes,
            };
        },
        downloadNodeManagerAsJson() {
            const nodeManagerData = this.convertNodeManagerToJson();

            // 创建一个 Blob 对象，用于保存 JSON 数据
            const blob = new Blob([JSON.stringify(nodeManagerData)], { type: 'application/json' });

            // 创建一个下载链接
            const url = URL.createObjectURL(blob);

            // 创建一个虚拟的下载链接并模拟点击
            const a = document.createElement('a');
            a.href = url;
            a.download = 'node-manager-data.json'; // 文件名
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            // 清除 Blob 和链接对象
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        // 切换内容时加载或清除关系图
        loadRelationChart() {
            // 清除关系图容器
            const chartContainer = d3.select("#d3-chart");
            if (chartContainer) {
                chartContainer.html('');
            }
            // 清除旧的数据
            this.data = {
                nodes: [],
                links: []
            };

            if (this.selectedOption === 'Network') {
                // 创建关系图容器
                // 创建关系图容器
                const d3chart = d3.select("#chart-container")
                    .append("div")
                    .attr("id", "d3-chart");

                this.data.nodes = this.nodeManager.nodes;

                // 遍历nodeManager中的所有节点
                this.nodeManager.nodes.forEach(node => {
                    // 遍历节点的关系
                    node.relations.forEach(relation => {
                        // 创建一个链接对象表示节点之间的关系
                        var link;
                        //将好友的链接值设置为
                        if (relation.tag === NodeTag.PERSON) {
                            link = {
                                source: node.id,
                                target: relation.id,
                                value: 1, // 适当设置链接的值
                            };

                        }
                        else {
                            link = {
                                source: node.id,
                                target: relation.id,
                                value: relation.relationCoefficient, // 适当设置链接的值
                            };
                        }

                        // 将链接对象添加到链接数组中
                        this.data.links.push(link);
                    });
                });

                // 调用函数创建关系图
                this.createRelationshipChart(this.data);
            }
        },
        // 鼠标悬停时显示提示框
        showTooltip(event, d) {
            const tooltip = document.getElementById("tooltip");
            tooltip.innerHTML = d.name;

            // 设置提示框的位置，使用clientX和clientY
            tooltip.style.left = event.clientX - 300 + "px";
            tooltip.style.top = event.clientY - 100 + "px";
            tooltip.style.display = "block";
        },
        // 鼠标移出时隐藏提示框
        hideTooltip() {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
        },
        NodeTextNoVisibility() {
            this.showNodeText = false;
            // 更新节点文本的可见性，只选择带有 .node-text 类的元素
            d3.select("#d3-chart")
                .selectAll(".node-text")
                .attr("visibility", this.showNodeText ? "visible" : "hidden");
            // 更新节点文本的可见性
        },
        NodeTextVisibility() {
            this.showNodeText = true;
            // 更新节点文本的可见性，只选择带有 .node-text 类的元素
            d3.select("#d3-chart")
                .selectAll(".node-text")
                .attr("visibility", this.showNodeText ? "visible" : "hidden");
            // 更新节点文本的可见性
        },
        createRelationshipChart() {
            // 定义容器的宽度和高度
            const width = window.innerWidth * 0.79;
            const height = window.innerHeight * 0.79;

            // 定义颜色比例尺
            const color = d3.scaleOrdinal(d3.schemeCategory10);

            // 创建节点和连接的副本以避免改变原始数据
            const links = this.data.links.map(d => ({ ...d }));
            const nodes = this.data.nodes.map(d => ({ ...d }));

            // 创建力导向图仿真
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(150)) // 增加 distance 的值
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", ticked);

            // 创建SVG容器
            const svg = d3.select("#d3-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);


            // 添加连接线
            const link = svg.append("g")
                .attr("stroke", "#e6e6fa") // 淡紫色
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("stroke-width", d => Math.sqrt(d.value));

            // 添加节点
            // 在 createRelationshipChart 函数中定义颜色映射
            const colorMapping = {
                [NodeTag.PRIMARY_SCHOOL]: "#7FFFAA",
                [NodeTag.JUNIOR_HIGH]: "#FF1493",
                [NodeTag.SENIOR_HIGH]: "#F08080",
                [NodeTag.UNIVERSITY]: "	#9370DB"
            };

            const node = svg.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", d => {
                    if (d.tag === NodeTag.PERSON) {
                        // 如果是个人节点，半径为10
                        return 10;
                    } else {
                        // 如果是群组节点，半径为20
                        return 15;
                    }
                })
                .attr("fill", d => {
                    if (d.tag === NodeTag.PERSON) {
                        // 如果是个人节点，根据性别分配颜色
                        return d.gender === PersonGender.MALE ? "skyblue" : "pink";
                    } else if (colorMapping[d.tag]) {
                        // 使用颜色映射
                        return colorMapping[d.tag];
                    } else {
                        // 其他节点的颜色分配
                        return color(d.tag);
                    }
                })
            // 添加拖动行为
            node.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

            // 在节点的鼠标悬停事件处理函数中突出显示相关节点的边框
            node.on("mouseover", (event, d) => {
                // 鼠标悬停时显示提示框
                this.showTooltip(event, d);

                const connectedNodeIds = links
                    .filter(link => link.source.id === d.id || link.target.id === d.id)
                    .map(link => (link.source.id === d.id ? link.target.id : link.source.id))
                    .concat(d.id);

                // 突出显示与当前节点相连的节点
                node.attr("stroke-width", nodeData => {
                    if (connectedNodeIds.includes(nodeData.id)) {
                        return 5; // 相关节点的边框宽度增大为3
                    } else {
                        return 1.5; // 其他节点的边框宽度为1.5
                    }
                })
                    .attr("stroke", nodeData => {
                        if (connectedNodeIds.includes(nodeData.id)) {
                            return "#7B68EE"; 
                        } else {
                            return "#fff"; 
                        }
                    });

                // 突出显示与悬停节点相连的节点的边框
                link.attr("stroke-width", linkData => {
                    if (linkData.source.id === d.id || linkData.target.id === d.id) {
                        return 5; // 相关节点的边框宽度增大为2
                    } else {
                        return 1; // 其他节点的边框宽度为1
                    }
                })
                    .attr("stroke", linkData => {
                        if (linkData.source.id === d.id || linkData.target.id === d.id) {
                            return "#6495ED"; 
                        } else {
                            return "#e6e6fa"; 
                        }
                    });
            })
                .on("mouseout", () => {
                    // 鼠标移出时隐藏提示框并恢复节点和线的原始边框宽度和颜色
                    this.hideTooltip();
                    node.attr("stroke-width", 1.5) // 恢复节点的原始边框宽度
                        .attr("stroke", "white"); // 恢复节点的原始边框颜色
                    link.attr("stroke-width", d => Math.sqrt(d.value)) // 恢复连接的原始边框宽度
                        .attr("stroke", "#e6e6fa"); // 恢复连接的原始边框颜色
                });


            // 节点名称
            // 添加节点文本
            const nodeText = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .enter()
                .append("text")
                .attr("class", "node-text") // 添加类
                .attr("dy", -10)
                .attr("text-anchor", "middle")
                .text(d => d.name)
                .style("font-size", "12px")
                .style("fill", "#00008B");

            // 根据按钮状态设置文本可见性
            nodeText.attr("visibility", this.showNodeText ? "visible" : "hidden");

            // 更新连接线和节点位置
            function ticked() {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                // 更新节点文本的位置
                nodeText
                    .attr("x", d => d.x) // 将文本的x位置与节点的x位置对齐
                    .attr("y", d => d.y + 35); // 将文本的y位置与节点的y位置对齐
            }

            // 拖动开始时重启仿真，并固定节点位置
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            // 拖动过程中更新节点位置
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            // 拖动结束后恢复仿真并取消节点位置的固定
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return svg.node();
        },
        // 显示个人结点添加表单
        showPersonAddForm() {
            this.isPersonAddVisible = true;
        },

        // 隐藏个人结点添加表单
        hidePersonAddForm() {
            this.isPersonAddVisible = false;
        },
        // 提交表单
        addPersonNode() {
            // 获取用户输入的数据
            const name = this.PersonFormData.name;
            const gender = this.PersonFormData.gender;
            const selectedGroupIds = this.PersonFormData.groups;
            const selectedFriendIds = this.PersonFormData.friends;

            // 检查是否有缺少的信息
            if (!name || !gender) {
                // 弹出警告框，提示用户填写所有必要信息
                alert('请填写个人结点的必要信息：姓名、性别');
                return; // 阻止继续执行
            }

            // 根据群组ID获取群组对象并创建新的个人结点
            const selectedGroups = selectedGroupIds.map(groupId => {
                return this.nodeManager.getNodeById(groupId);
            });

            // 根据好友ID获取好友对象并添加到新的个人结点中
            const selectedFriends = selectedFriendIds.map(friendId => {
                return this.nodeManager.getNodeById(friendId);
            });

            const newNode = new PersonNode(name, gender);

            // 将新结点与选定的群组和好友建立关联关系
            for (const group of selectedGroups) {
                newNode.addRelation(group);
            }

            for (const friend of selectedFriends) {
                newNode.addRelation(friend);
            }

            // 插入新结点到 nodeManager 中
            this.nodeManager.insert(newNode);

            // 清空表单数据
            this.PersonFormData.name = '';
            this.PersonFormData.gender = PersonGender.MALE;
            this.PersonFormData.groups = [];
            this.PersonFormData.friends = [];

            // 隐藏表单
            this.hidePersonAddForm();

            // 弹出成功提示
            alert('成功添加新的个人结点！');

        },
        // 显示群组结点添加表单
        showGroupAddForm() {
            this.isGroupAddVisible = true;
        },

        // 隐藏群组结点添加表单
        hideGroupAddForm() {
            this.isGroupAddVisible = false;
        },
        //添加群组结点
        addGroupNode() {
            // 获取群组表单数据
            const name = this.GroupFormData.name;
            const coefficient = this.GroupFormData.relationCoefficient;
            const tag = this.GroupFormData.tag;

            // 检查是否有缺少的信息
            if (!name) {
                // 弹出警告框，提示用户填写所有必要信息
                alert('请填写群组结点的必要信息：群组名');
                return; // 阻止继续执行
            }

            // 创建一个新的群组节点
            const newGroupNode = new GroupNode(name, tag, coefficient);;

            // 将新群组节点添加到你的数据结构中（假设使用了 nodeManager）
            this.nodeManager.insert(newGroupNode);

            // 清空表单数据
            this.GroupFormData.name = '';
            this.GroupFormData.relationCoefficient = 1;
            this.GroupFormData.tag = NodeTag.GROUP;

            // 隐藏群组添加表单
            this.hideGroupAddForm();
            // 弹出成功提示
            alert('成功添加新的群组结点！');
        },
        // 打开编辑个人结点表单，并加载选中的个人结点信息
        showEditPersonNodeForm(personNodeId) {
            const personNode = this.nodeManager.getNodeById(personNodeId);

            if (personNode) {
                // 将选中的个人结点信息加载到表单数据中
                this.EditedPersonData.id = personNodeId;
                this.EditedPersonData.name = personNode.name;
                this.EditedPersonData.gender = personNode.gender;

                for (const relation of personNode.relations) {
                    if (relation.tag === NodeTag.PERSON) {
                        // 如果是个人结点，添加到好友列表
                        this.EditedPersonData.friends.push(relation.id);
                        this.editPreviousPersonRelation.friends.push(relation.id);
                    } else {
                        // 如果不是个人结点，添加到群组列表
                        this.EditedPersonData.groups.push(relation.id);
                        this.editPreviousPersonRelation.groups.push(relation.id);
                    }
                }
                // 显示编辑个人结点表单
                this.isPersonEditVisible = true;
            }
        },

        // 保存编辑后的个人结点信息
        updatePersonNode() {
            // 获取编辑后的个人结点数据
            const editedPersonData = this.EditedPersonData;
            // 找到要编辑的个人结点
            const editedPersonNode = this.nodeManager.getNodeById(editedPersonData.id);
            // 找出新添加的关系
            const addGroups = editedPersonData.groups.filter(group => !this.editPreviousPersonRelation.groups.includes(group));
            const addFriends = editedPersonData.friends.filter(friend => !this.editPreviousPersonRelation.friends.includes(friend));
            // 找出新删除的关系
            const removeGroups = this.editPreviousPersonRelation.groups.filter(group => !editedPersonData.groups.includes(group));
            const removeFriends = this.editPreviousPersonRelation.friends.filter(friend => !editedPersonData.friends.includes(friend));


            if (editedPersonNode) {
                // 更新个人结点的信息
                if (editedPersonData.name) {
                    editedPersonNode.name = editedPersonData.name;
                }
                if (editedPersonData.gender) {
                    editedPersonNode.gender = editedPersonData.gender;
                }

                // 处理添加和删除的关系
                for (const groupId of addGroups) {
                    const groupNode = this.nodeManager.getNodeById(groupId);
                    editedPersonNode.addRelation(groupNode);

                }

                for (const friendId of addFriends) {
                    const friendNode = this.nodeManager.getNodeById(friendId);
                    // 添加好友关系（如果尚未存在）
                    editedPersonNode.addRelation(friendNode);
                }

                for (const groupId of removeGroups) {
                    const groupNode = this.nodeManager.getNodeById(groupId);
                    // 删除群组关系（如果存在）
                    editedPersonNode.removeRelation(groupNode);
                }

                for (const friendId of removeFriends) {
                    const friendNode = this.nodeManager.getNodeById(friendId);
                    // 删除好友关系（如果存在）
                    editedPersonNode.removeRelation(friendNode);
                }

                // 清空表单数据
                this.EditedPersonData.id = '';
                this.EditedPersonData.name = '';
                this.EditedPersonData.gender = PersonGender.MALE;
                this.EditedPersonData.groups = [];
                this.EditedPersonData.friends = [];

                // 隐藏编辑个人结点表单
                this.isPersonEditVisible = false;

                // 弹出成功提示
                alert('成功编辑个人结点！');
            }
        },
        // 隐藏编辑群组结点表单
        hidePersonEditForm() {
            //清空表单数据
            this.EditedPersonData.id = '';
            this.EditedPersonData.name = '';
            this.EditedPersonData.gender = PersonGender.MALE;
            this.EditedPersonData.groups = [];
            this.EditedPersonData.friends = [];
            this.isPersonEditVisible = false;
        },
        // 打开编辑群组结点表单，并加载选中的群组结点信息
        showEditGroupNodeForm(groupId) {
            const groupNode = this.nodeManager.getNodeById(groupId);
            if (groupNode) {
                // 将选中的群组结点信息加载到表单数据中
                this.EditedGroupData.id = groupNode.id;
                this.EditedGroupData.name = groupNode.name;
                this.EditedGroupData.relationCoefficient = groupNode.relationCoefficient;
                this.EditedGroupData.tag = groupNode.tag;

                // 显示编辑群组结点表单
                this.isGroupEditVisible = true;
            }
        },
        // 保存编辑后的群组结点信息
        updateGroupNode() {
            // 获取编辑后的群组结点数据
            const editedGroupData = this.EditedGroupData;

            // 找到要编辑的群组结点
            const editedGroupNode = this.nodeManager.getNodeById(editedGroupData.id);

            if (editedGroupNode) {
                // 更新群组结点的信息
                if (editedGroupData.name) {
                    editedGroupNode.name = editedGroupData.name;
                }
                editedGroupNode.relationCoefficient = editedGroupData.relationCoefficient;
                editedGroupNode.tag = editedGroupData.tag;

                // 隐藏编辑群组结点表单
                this.isGroupEditVisible = false;

                // 弹出成功提示
                alert('成功编辑群组结点！');

            }
        },
        // 隐藏编辑群组结点表单
        hideGroupEditForm() {
            this.isGroupEditVisible = false;
        },
        // 打开删除个人结点的提示窗口
        showDeletePersonNodeDialog(personNodeId) {
            const personNode = this.nodeManager.getNodeById(personNodeId);
            if (personNode) {
                // 设置正在删除的个人结点
                this.deletingPersonNode = personNode;
                // 显示删除个人结点的提示窗口
                this.isDeletePersonNodeDialogVisible = true;
            }
        },

        // 关闭删除个人结点的提示窗口
        hideDeletePersonNodeDialog() {
            // 清空正在删除的个人结点
            this.deletingPersonNode = null;
            // 隐藏删除个人结点的提示窗口
            this.isDeletePersonNodeDialogVisible = false;
        },

        // 执行删除个人结点的操作
        deletePersonNode() {
            if (this.deletingPersonNode) {
                // 删除个人结点及其所有关系
                this.nodeManager.remove(this.deletingPersonNode);

                // 隐藏删除个人结点的提示窗口
                this.hideDeletePersonNodeDialog();

                // 弹出删除成功提示
                alert('成功删除个人结点及其所有关系！');
            }
        },
        showDeleteGroupNodeDialog(groupNodeId) {
            const groupNode = this.nodeManager.getNodeById(groupNodeId);
            this.deletingGroupNode = groupNode;
            this.isDeleteGroupNodeDialogVisible = true;
        },
        hideDeleteGroupNodeDialog() {
            this.deletingGroupNode = null;
            this.isDeleteGroupNodeDialogVisible = false;
        },
        deleteGroupNode() {
            if (this.deletingGroupNode) {
                // 删除群组结点及其所有关系
                this.nodeManager.remove(this.deletingGroupNode);

                // 隐藏删除群组结点的提示窗口
                this.hideDeleteGroupNodeDialog();

                // 弹出删除成功提示
                alert('成功删除群组结点及其所有关系！');
            }
        },
        //用于推荐好友
        calculateRecommendedFriends(centerNode) {
            const recommendList = [];

            if (centerNode === null) {
                return recommendList;
            }

            // 创建一个 Map 用于存储推荐好友信息
            const relationIndexMap = new Map();

            // 遍历中心节点的关系
            centerNode.relations.forEach((friend) => {
                friend.relations.forEach((secFriend) => {
                    // 检查是否是潜在好友的条件
                    if (
                        secFriend.tag === NodeTag.PERSON &&
                        !centerNode.relations.includes(secFriend) &&
                        secFriend !== centerNode
                    ) {
                        // 初始化或获取潜在好友的信息
                        let fkObj = relationIndexMap.get(secFriend) || {
                            idx: 0,
                            commonFriends: 0,
                            commonOrganizations: 0,
                            node: secFriend,
                        };

                        if (friend.tag === NodeTag.PERSON) {
                            // 如果 friend 是个人节点，增加推荐指数和共同好友数量
                            fkObj.idx += 0.8;
                            fkObj.commonFriends++;
                        } else {
                            // 如果 friend 是群组节点，增加推荐指数和共同组织数量
                            fkObj.idx += friend.relationCoefficient;
                            fkObj.commonOrganizations++;
                        }

                        // 更新或添加潜在好友信息
                        relationIndexMap.set(secFriend, fkObj);
                    }
                });
            });

            // 将推荐好友信息转为数组并按推荐指数降序排序
            const recommendedFriends = Array.from(relationIndexMap.values()).sort(
                (a, b) => b.idx - a.idx
            );

            return recommendedFriends;
        },
        // 根据选中的结点生成推荐好友列表
        generateRecommendedFriends(personNodeId) {
            this.selectedNode = this.nodeManager.getNodeById(personNodeId);

            if (!this.selectedNode) return;

            // 调用计算推荐好友的函数
            this.recommendedFriends = this.calculateRecommendedFriends(this.selectedNode);

            // 显示推荐好友窗口
            this.showRecommendFriends = true;
        },
        // 添加好友
        addFriend(friendNode) {
            // 在此处执行添加好友的逻辑，可以根据需要修改
            this.selectedNode.addRelation(friendNode);
            // 弹出删除成功提示
            alert('成功添加好友！');

            // 关闭推荐好友窗口
            this.showRecommendFriends = false;

        },
        // 关闭推荐好友窗口
        closeRecommendFriends() {
            this.showRecommendFriends = false;
        },


    },
    watch: {
        selectedOption: 'loadRelationChart',
    },
});

