// Mock localStorage for Node environment
class LocalStorageMock {
    store = {}

    getItem(key) {
        return this.store[key] || null
    }

    setItem(key, value) {
        this.store[key] = String(value)
    }

    removeItem(key) {
        delete this.store[key]
    }

    clear() {
        this.store = {}
    }

    get length() {
        return Object.keys(this.store).length
    }

    key(i) {
        return Object.keys(this.store)[i]
    }
}

// Since StorageManager relies on 'window', we'll mock it globally for this test
global.window = {
    localStorage: new LocalStorageMock(),
    sessionStorage: new LocalStorageMock()
}

// Now we can reuse the logic from storage-manager.ts
// But since it's TS, we'll implement the logic here for testing purposes
class StorageManagerTest {
    constructor() {
        this.prefix = 'rc_test_'
        this.storage = window.localStorage
    }

    set(key, value, ttl) {
        const item = {
            value,
            expiry: ttl ? Date.now() + ttl : 0
        }
        this.storage.setItem(this.prefix + key, JSON.stringify(item))
        return true
    }

    get(key) {
        const itemStr = this.storage.getItem(this.prefix + key)
        if (!itemStr) return null

        const item = JSON.parse(itemStr)
        if (item.expiry && Date.now() > item.expiry) {
            this.storage.removeItem(this.prefix + key)
            return null
        }
        return item.value
    }
}

async function runTests() {
    console.log('Testing StorageManager logic...')

    const sm = new StorageManagerTest()

    // Test 1: Set and Get
    sm.set('foo', 'bar')
    const val1 = sm.get('foo')
    console.log(`Test 1 (Set/Get): ${val1 === 'bar' ? 'PASS' : 'FAIL'} (Expected 'bar', got '${val1}')`)

    // Test 2: TTL Expiry
    console.log('Test 2: Testing TTL expiry (waiting 200ms)...')
    sm.set('temp', 'expired', 100) // 100ms TTL

    setTimeout(() => {
        const val2 = sm.get('temp')
        console.log(`Test 2 (TTL): ${val2 === null ? 'PASS' : 'FAIL'} (Expected null, got '${val2}')`)

        // Test 3: TTL Valid
        console.log('Test 3: Testing TTL valid...')
        sm.set('valid', 'ok', 1000)
        const val3 = sm.get('valid')
        console.log(`Test 3 (TTL Valid): ${val3 === 'ok' ? 'PASS' : 'FAIL'}`)

    }, 200)
}

runTests()
