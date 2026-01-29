export const categories = {
  indoor: {
    title: "🏠 Indoor & Hardy",
    id: "cat-indoor",
    products: [
      { id: 1, name: "Sansevieria Laurentii", category: "Snake Plant", price: 499, image: "https://imgs.search.brave.com/HUvl2qWK65tS4MT8iO4DSedBxDhL8XqCMGGbCzvK81A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/MTIzbGVzcGxhbnRl/cy5mci9tZWRpYS9j/YXRhbG9nL3Byb2R1/Y3QvY2FjaGUvMGRi/YzAyMjFlZDg4OGY5/ODQ1YTEyNjEyMDAw/ZDQxZWMvcy9hL3Nh/bnNldmllcmlhX2xh/dXJlbnRpaV9wbGFu/dC5qcGc", badge: "Best Seller" },
      { id: 2, name: "Sansevieria Moonshine", category: "Snake Plant", price: 549, image: "https://imgs.search.brave.com/YUO0UFFTr_iqmQIZP8fUaLJNSHEmR_1rpVmZ-Es3vlQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ldXJl/a2EtZmFybXMuY29t/L2Nkbi9zaG9wL3By/b2R1Y3RzL2ltYWdl/XzJmZDI5MjZmLTc0/NzItNGM5Zi04MDAz/LWYzMjdkODA3YjEy/Ni5qcGc_dj0xNjU4/MTk3MjQ0JndpZHRo/PTE1MDA" },
      { id: 3, name: "Cylindrica (Braided)", category: "Snake Plant", price: 699, image: "https://imgs.search.brave.com/qI8BAD2-5Y3VFoHEOY8aaTOxEE_LGYGHM49IUKlmWCg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFm/Y3VsdHVyZS5jby51/ay9jZG4vc2hvcC9m/aWxlcy9TYW5zZXZp/ZXJpYS1jeWxpbmRy/aWNhLUJyYWlkLVNu/YWtlLXBsYW50LUxl/YWYtQ3VsdHVyZS00/MTYyNjM0MjJfMTAw/MHguanBnP3Y9MTcy/MTM4MjgzMg" },
      { id: 4, name: "ZZ Zamia Green", category: "ZZ Plant", price: 599, image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=600&q=80" },
      { id: 5, name: "ZZ Raven (Black)", category: "ZZ Plant", price: 999, image: "https://imgs.search.brave.com/itPBJ8Usr0sEg86mVXz0jpmDEGO-kU8hVVDgc_L8CIw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFaeVRXRXNDVkwu/anBn", badge: "Rare" },
      { id: 6, name: "Peace Lily", category: "Purifier", price: 349, image: "https://imgs.search.brave.com/oAHYxpPaaLdBp5431hl80BwPB7Nq-rn_mPNDhLsihIE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE1LzQ2LzgwLzg2/LzM2MF9GXzE1NDY4/MDg2MzNfdzhMSXQ0/cmdycGdLQ0R5NkI1/OFdVMUtva1I3ampj/S1IuanBn" },
    ]
  },
  foliage: {
    title: "🌿 Foliage & Vining",
    id: "cat-foliage",
    products: [
      { id: 7, name: "Golden Money Plant", category: "Pothos", price: 199, image: "https://imgs.search.brave.com/Ub4TbuehQRXYLkVwNzqbDrs0a5Ah6OXNLQaNvxsZjyE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGFu/dG9yYml0LmNvbS9j/ZG4vc2hvcC9maWxl/cy93LVBob3Rvcm9v/bV8xNi5qcGc_dj0x/NzU0MjM4NDIyJndp/ZHRoPTE0NDU" },
      { id: 8, name: "Marble Queen Pothos", category: "Pothos", price: 249, image: "https://imgs.search.brave.com/pvQGbOdDGMwO31rU8wl7b1prOnjdEr6Tr4-zx6dMmtI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z2FyZGVuaWEubmV0/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI0/LzAyL3NodXR0ZXJz/dG9ja18xOTM5MTYz/MzE3LmpwZw" },
      { id: 9, name: "Neon Pothos", category: "Pothos", price: 229, image: "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=600&q=80" },
      { id: 10, name: "Monstera Deliciosa", category: "Exotic", price: 1299, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  outdoor: {
    title: "🌻 Outdoor & Blooms",
    id: "cat-outdoor",
    products: [
      { id: 11, name: "Rose (Desi Red)", category: "Flower", price: 149, image: "https://imgs.search.brave.com/21AMADWHaL4oPBDfwjonnextIbR_PpaMGukUoo8Zrso/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFic2VGZ0RFcEwu/anBn" },
      { id: 12, name: "Hibiscus Hybrid", category: "Shrub", price: 299, image: "https://imgs.search.brave.com/YSAEyhwD9RVpnP3Lh4pa3PWJadiiQOLA6C5s3yCNKX8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFJeEYrUmNHaEwu/anBn" },
      { id: 13, name: "Mango (Amrapali)", category: "Fruit", price: 499, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" },
      { id: 14, name: "Tulsi / Neem", category: "Sacred", price: 99, image: "https://imgs.search.brave.com/-gOMjYBpzdUOifR520B7Go3yBQfi7LsXcY28UzY9648/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vZ2FjaHdh/bGEuaW4vd3AtY29u/dGVudC91cGxvYWRz/LzIwMjIvMDYvdHVs/c2kuanBnP2ZpdD0y/MDAwLDIwMDAmc3Ns/PTE" }
    ]
  },
  pots: {
    title: "🛠️ Pots & Care Tools",
    id: "cat-pots",
    products: [
      { id: 15, name: "Plastic Pots (Set of 3)", category: "Basic", price: 299, image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=600&q=80" },
      { id: 16, name: "Ceramic Pot White", category: "Premium", price: 499, image: "https://imgs.search.brave.com/AKdO2cqfcSrNoTf21sXBy--gRco8keGH5kHH8dHuNWA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9udXJz/ZXJ5bGl2ZS5jb20v/Y2RuL3Nob3AvcHJv/ZHVjdHMvbnVyc2Vy/eWxpdmUtcGxhbnRl/cnMtMy0zLWluY2gt/OC1jbS1zcXVhcmUt/Ym94LWNlcmFtaWMt/cG90LXdoaXRlLTE2/OTY4NDU4MDc2MzAw/XzUxMng1MTIuanBn/P3Y9MTYzNDIwNzc0/MA" },
      { id: 17, name: "Pruner & Trowel Set", category: "Tools", price: 599, image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=600&q=80" }
    ]
  }
};

export const furniture = {
    title: "Premium Furniture",
    id: "furniture",
    products: [
        { id: 101, name: "Nordic Chair", category: "Living Room", price: 4999, image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80" },
        { id: 102, name: "Coffee Table", category: "Living Room", price: 8500, image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80" },
        { id: 103, name: "Plant Stand", category: "Accessories", price: 1999, image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80" },
        { id: 104, name: "Bookshelf", category: "Office", price: 12499, image: "https://imgs.search.brave.com/uggikiX4YtP9qYMIkjQtULEYBWYOlgH9Ysk5g5keLaA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2Q1LzVm/L2I1L2Q1NWZiNTdl/MTE2ZmM5MTE0ZThj/MjQwMmUwMjNmZDZh/LmpwZw" }
    ]
}