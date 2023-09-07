class HashTable {
    constructor() {
        this.storage = [];//存储数组
        this.count = 0;//计算已经存储的元素个数
        this.limit = 0;//一共可以存放多少元素
    }
    //哈希函数
    hashFunc(str, size) {
        //1.定义hashCode变量
        let hashCode = 0;
        //2.霍纳法则，计算hashCode的值
        for (let i = 0; i < str.length; i++) {
            hashCode = 37 * hashCode + str.charCodeAt(i);//获取某个字符对应的unicode编码
        }
        //3.取余操作
        let index = hashCode % size;
        return index;
    }
    //一.插入&修改操作
    put(key, value) {
        //1.根据key获取对应的index
        let index = this.hashFunc(key, this.limit);
        //2.根据index取出对应的bucket
        let bucket = this.storage[index];
        //3.判断该bucket是否为null
        if (bucket == null) {
            bucket = [];
            this.storage[index] = bucket;
        }
        //4.判断是否是修改数据
        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            if (tuple[0] == key) {
                tuple[1] = value;
                return 1;
            }
        }
        //5.进行添加操作
        bucket.push([key, value]);
        this.count += 1;
        return 0;
        //6.判断是否需要扩容操作
        // if (this.count > this.limit * 0.75) {
        //     let newSize = this.limit * 2;
        //     let newPrime = this.getPrime(newSize);
        //     this.resize(newPrime);
        // }
    }

    //二.查找操作
    get(key) {
        //1.根据key获取对应的index
        let index = this.hashFunc(key, this.limit);
        //2.根据index获取对应的bucket
        let bucket = this.storage[index];
        //3.根据index获取对应的bucket
        if (bucket == null) {
            return null;
        }
        //4.有bucket，那么就进行线性查找
        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            if (tuple[0] == key) {
                return tuple[1];
            }
        }
        //5.依然没有找到，那么返回null
        return null;
    }
    //三、删除操作
    remove(key) {
        //1.根据key获取对应的index
        let index = this.hashFunc(key, this.limit);
        //2.根据index获取对应的bucket
        let bucket = this.storage[index];
        //3.判断bucket是否为null
        if (bucket == null) {
            return null;
        }
        //4.有bucket,那么就进行线性查找并删除
        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            if (tuple[0] == key) {
                bucket.splice(i, 1);
                this.count -= 1;

                // if (this.limit > 7 && this.count < this.limit * 0.25) {
                //     let newSize = Math.floor(this.limit / 2);
                //     let newPrime = this.getPrime(newSize);
                //     this.resize(newPrime);
                // }

                return tuple[1];
            }
        }
        //5.依然没有找到，返回null
        return null;
    }

    //判断哈希表是否为null
    isEmpty() {
        return this.count == 0;
    }
    //获取哈希表中元素的个数
    size() {
        return this.count;
    }
    //哈希表的扩容
    resize(newLimit) {
        let oldStorage = this.storage;
        this.storage = [];
        this.count = 0;
        this.limit = newLimit;

        for (let i = 0; i < oldStorage.length; i++) {
            const bucket = oldStorage[i];
            if (bucket == null) {
                continue;
            }
            for (let j = 0; j < bucket.length; j++) {
                const tuple = bucket[j];
                this.put(tuple[0], tuple[1]);
            }
        }
    }
    //判断传入的num是否质数
    isPrime(num) {
        if (num <= 1) {
            return false;
        }
        for (var i = 2; i <= Math.sqrt(num); i++) {
            if (num % i == 0) {
                return false;
            }
        }
        return true;
    }
    //获取质数
    getPrime(num) {
        while (!this.isPrime(num)) {
            num++;
        }
        return num;
    }
}
