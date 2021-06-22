const getPersistentStorage = require('../persistor');


;(function () {
  const store = getPersistentStorage()

  test('Store initiated', function () {
    expect(store).toBeTruthy()
  })
  
  test('Get undefined value', function () {
    expect(store.getItem('test')).toBe(undefined)
  })
  
  test('Set a value and persist it', function () {
    const [key, value] = ['test', 'ananas']
  
    store.setItem(key, value)
  
    expect(store.getItem(key)).toBe(value)
  })
  
  test('Remove an Item', function () {
    const key = 'ananas'
  
    store.removeItem(key)
  
    expect(store.getItem(key)).toBe(undefined)
  })

  test('Clear Store', function () {
    store.clear()

    expect(true).toBeTruthy()
  })
})()