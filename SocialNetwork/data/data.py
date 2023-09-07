import random
import json
from faker import Faker

# 创建虚假数据生成器
fake = Faker("zh_CN")

# 初始化节点ID计数器
next_node_id = 1

# 生成随机节点数据
def generate_random_node(tag,num_nodes):
    global next_node_id  # 使用全局变量来跟踪节点ID
    node = {}
    node["tag"] = tag
    node["id"] = next_node_id  # 使用递增的ID
    next_node_id += 1
     # 生成不包括自己的 ID 在 1 到 num_nodes 范围内的整数列表
    node["relations"] = [i for i in range(1, num_nodes + 1) if i != node["id"]]
    
    node["coef"] = random.randint(1, 20)   # 随机生成 coef 值
    if tag == "person":
        node["name"] = fake.name()
        node["gender"] = random.choice(["male", "female"])
    elif tag == "primary school":
        node["name"] = fake.company()+"小学"
    elif tag == "junior high":
        node["name"] = fake.company()+"初中"
    elif tag == "senior high":
        node["name"] = fake.company()+"高中"
    elif tag == "university":
        node["name"] = fake.company()+"大学"
    elif tag == "group":
        node["name"] = fake.word()+"组织"
    return node

# 生成随机节点列表
num_nodes = 100  # 生成的节点数量
nodes = []

for _ in range(num_nodes):
    tag = random.choice(["person", "primary school", "junior high", "senior high", "university", "group"])
    node = generate_random_node(tag,num_nodes)
    nodes.append(node)

# 构建数据字典
data = {
    "nextId": next_node_id,  # 设置下一个可用的节点ID
    "nodes": nodes
}

# 将数据写入 JSON 文件
with open("generated_data.json", "w", encoding='utf-8') as json_file:
    json.dump(data, json_file, ensure_ascii=False, indent=4)

print("数据已写入 generated_data.json 文件。")
