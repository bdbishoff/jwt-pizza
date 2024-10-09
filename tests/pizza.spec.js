import { test, expect } from "playwright-test-coverage";

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

test("purchase with login", async ({ page }) => {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      { id: 2, title: "Pepperoni", image: "pizza2.png", price: 0.0042, description: "Spicy treat" },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: { id: 3, name: "Kai Chen", email: "d@jwt.com", roles: [{ role: "diner" }] },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/order", async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: "Veggie", price: 0.0038 },
        { menuId: 2, description: "Pepperoni", price: 0.0042 },
      ],
      storeId: "4",
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 },
        ],
        storeId: "4",
        franchiseId: 2,
        id: 23,
      },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto("http://localhost:5173/");

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText("Send me those 2 pizzas right now!");
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("login, create and delete franchise", async ({ page }) => {
  // Mock admin auth req
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
      const loginReq = {
        email: "a@jwt.com",
        password: "admin",
      };
      const loginRes = {
        user: {
          id: 1,
          name: "常用名字",
          email: "a@jwt.com",
          roles: [
            {
              role: "admin",
            },
            {
              objectId: 1,
              role: "franchisee",
            },
            {
              objectId: 2,
              role: "franchisee",
            },
            {
              objectId: 3,
              role: "franchisee",
            },
          ],
        },
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9LHsib2JqZWN0SWQiOjEsInJvbGUiOiJmcmFuY2hpc2VlIn0seyJvYmplY3RJZCI6Miwicm9sZSI6ImZyYW5jaGlzZWUifSx7Im9iamVjdElkIjozLCJyb2xlIjoiZnJhbmNoaXNlZSJ9XSwiaWF0IjoxNzI4NTA1MjgyfQ.vgZ1gyMQgAnd9CA5Usi0O97wYw5M4v8s5YpmkkX9Mrg",
      };
      expect(route.request().method()).toBe("PUT");
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }

    if (route.request().method() === "DELETE") {
      const logoutRes = {
        message: "logout successful",
      };
      expect(route.request().method()).toBe("DELETE");
      await route.fulfill({ json: logoutRes });
    }

    // further mock depending if route can be both put and get
  });

  let franchiseRes = [
    {
      id: 3,
      name: "dmfh9wu2b8",
      admins: [
        {
          id: 1,
          name: "常用名字",
          email: "a@jwt.com",
        },
      ],
      stores: [],
    },
    {
      id: 17,
      name: "lscl6fdcfi",
      admins: [
        {
          id: 6,
          name: "wjmdoija98",
          email: "wjmdoija98@admin.com",
        },
      ],
      stores: [],
    },
    {
      id: 19,
      name: "pizzaPocket",
      admins: [
        {
          id: 10,
          name: "pizza franchisee",
          email: "f@jwt.com",
        },
      ],
      stores: [],
    },
    {
      id: 18,
      name: "qbjh8xvd3x",
      admins: [
        {
          id: 6,
          name: "wjmdoija98",
          email: "wjmdoija98@admin.com",
        },
      ],
      stores: [],
    },
    {
      id: 2,
      name: "rtquj9m53q",
      admins: [
        {
          id: 1,
          name: "常用名字",
          email: "a@jwt.com",
        },
      ],
      stores: [],
    },
    {
      id: 1,
      name: "uqmxte637l",
      admins: [
        {
          id: 1,
          name: "常用名字",
          email: "a@jwt.com",
        },
      ],
      stores: [
        {
          id: 2,
          name: "SLC",
          totalRevenue: 0.171,
        },
      ],
    },
  ];

  await page.route("*/**/api/franchise", async (route) => {
    if (route.request().method() === "GET") {
      expect(route.request().method()).toBe("GET");
      await route.fulfill({ json: franchiseRes });
    }

    if (route.request().method() === "POST") {
      const franchiseReq = {
        stores: [],
        name: "hfxsy2rm7w",
        admins: [
          {
            email: "a@jwt.com",
          },
        ],
      };
      const franchiseResPost = {
        stores: [],
        name: "hfxsy2rm7w",
        admins: [
          {
            email: "a@jwt.com",
            id: 1,
            name: "常用名字",
          },
        ],
        id: 29,
      };
      franchiseRes.push(franchiseResPost);
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseResPost });
    }
  });

  await page.route("*/**/api/franchise/29", async (route) => {
    let deleteRes = [];
    franchiseRes.map((franchise) => {
      if (franchise.id !== 29) {
        deleteRes.push(franchise);
      }
    });
    franchiseRes = deleteRes;
    expect(route.request().method()).toBe("DELETE");
    const deleteFranchiseRes = {
      message: "franchise deleted",
    };
    await route.fulfill({ json: deleteFranchiseRes });
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("a@jwt.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByPlaceholder("franchise name").click();
  await page.getByPlaceholder("franchise name").fill("hfxsy2rm7w");
  await page.getByPlaceholder("franchisee admin email").click();
  await page.getByPlaceholder("franchisee admin email").fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  await page
    .getByRole("row", { name: `${"hfxsy2rm7w"} 常用名字 Close` })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText(`${"hfxsy2rm7w"} 常用名字`)).not.toBeVisible();
  await page.getByRole("link", { name: "Logout" }).click();

  // // Updated assertion to be more specific
  await expect(page.locator("main")).toContainText("The web's best pizza");
});

test("register", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = {
      name: "itzsd4f057",
      email: "2p74xg0pim@test.com",
      password: "v17apdrz71",
    };
    const loginRes = {
      user: {
        name: "itzsd4f057",
        email: "2p74xg0pim@test.com",
        roles: [
          {
            role: "diner",
          },
        ],
        id: 20,
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaXR6c2Q0ZjA1NyIsImVtYWlsIjoiMnA3NHhnMHBpbUB0ZXN0LmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifV0sImlkIjoyMCwiaWF0IjoxNzI4NTA5NTMwfQ.kZ8nM6jvp31VyA-H8MOIjzhlU-KfU2tEya_1TD1FqJM",
    };

    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").click();
  await page.getByPlaceholder("Full name").fill("itzsd4f057");
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("2p74xg0pim@test.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("v17apdrz71");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.locator("main")).toContainText("Pizza is an absolute delight");
});

test("login franchise, create store, delete store", async ({ page }) => {
  // mock the login auth
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
      const loginReq = {
        email: "f@jwt.com",
        password: "franchisee",
      };
      const loginRes = {
        user: {
          id: 10,
          name: "pizza franchisee",
          email: "f@jwt.com",
          roles: [
            {
              role: "diner",
            },
            {
              objectId: 19,
              role: "franchisee",
            },
          ],
        },
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsIm5hbWUiOiJwaXp6YSBmcmFuY2hpc2VlIiwiZW1haWwiOiJmQGp3dC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn0seyJvYmplY3RJZCI6MTksInJvbGUiOiJmcmFuY2hpc2VlIn1dLCJpYXQiOjE3Mjg1MDk4NDN9.dV6hEP-zl9qtzeGxcbJNb-fPaW_UYqhWRSBFELxh6kQ",
      };
      expect(route.request().method()).toBe("PUT");
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

  let franchiseRes = [
    {
      id: 19,
      name: "pizzaPocket",
      admins: [
        {
          id: 10,
          name: "pizza franchisee",
          email: "f@jwt.com",
        },
      ],
      stores: [],
    },
  ];

  await page.route("*/**/api/franchise/10", async (route) => {
    if (route.request().method() === "GET") {
      expect(route.request().method()).toBe("GET");
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.route("*/**/api/franchise/19/store", async (route) => {
    const franchiseReq = {
      name: "randomname",
    };
    const franchiseResPost = {
      id: 17,
      totalRevenue: 0,
      name: "randomname",
    };
    franchiseRes[0].stores.push(franchiseResPost);
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/franchise/19/store/17", async (route) => {
    let deleteRes = [];
    franchiseRes.map((franchise) => {
      if (franchise.id !== 17) {
        deleteRes.push(franchise);
      }
    });
    franchiseRes = deleteRes;
    expect(route.request().method()).toBe("DELETE");
    const deleteFranchiseRes = {
      message: "store deleted",
    };
    await route.fulfill({ json: deleteFranchiseRes });
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").fill("f@jwt.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("franchisee");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByLabel("Global").getByRole("link", { name: "Franchise" }).click();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByPlaceholder("store name").click();
  await page.getByPlaceholder("store name").fill("randomname");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("row", { name: "randomname 0 ₿ Close" }).getByRole("button").click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("randomname 0 ₿")).not.toBeVisible();
});

test("order and order history", async ({ page }) => {
  // mock the login auth
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
      const loginReq = {
        email: "d@jwt.com",
        password: "a",
      };
      const loginRes = {
        user: {
          id: 2,
          name: "Kai Chen",
          email: "d@jwt.com",
          roles: [
            {
              role: "diner",
            },
          ],
        },
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6IkthaSBDaGVuIiwiZW1haWwiOiJkQGp3dC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn1dLCJpYXQiOjE3Mjg1MTMwMzB9.7iuQ9sh4nAZOhygpAo_RDBFgvwiHf_kEWsrGxHgBen8",
      };
      expect(route.request().method()).toBe("PUT");
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "918z41pwqz",
        image: "fqu14c6ibe",
        price: 0.1,
        description: "zyfeziin7x",
      },
      {
        id: 2,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 3,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
      {
        id: 4,
        title: "Margarita",
        image: "pizza3.png",
        price: 0.0042,
        description: "Essential classic",
      },
      {
        id: 5,
        title: "Crusty",
        image: "pizza4.png",
        price: 0.0028,
        description: "A dry mouthed favorite",
      },
      {
        id: 6,
        title: "Charred Leopard",
        image: "pizza5.png",
        price: 0.0099,
        description: "For those with a darker side",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 3,
        name: "dmfh9wu2b8",
        stores: [],
      },
      {
        id: 17,
        name: "lscl6fdcfi",
        stores: [],
      },
      {
        id: 19,
        name: "pizzaPocket",
        stores: [],
      },
      {
        id: 18,
        name: "qbjh8xvd3x",
        stores: [],
      },
      {
        id: 2,
        name: "rtquj9m53q",
        stores: [],
      },
      {
        id: 1,
        name: "uqmxte637l",
        stores: [
          {
            id: 2,
            name: "SLC",
          },
        ],
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/order", async (route) => {
    if (route.request().method() === "POST") {
      const orderReq = {
        items: [
          {
            menuId: 2,
            description: "Veggie",
            price: 0.0038,
          },
          {
            menuId: 2,
            description: "Veggie",
            price: 0.0038,
          },
        ],
        storeId: "2",
        franchiseId: 1,
      };

      const orderRes = {
        order: {
          items: [
            {
              menuId: 2,
              description: "Veggie",
              price: 0.0038,
            },
            {
              menuId: 2,
              description: "Veggie",
              price: 0.0038,
            },
          ],
          storeId: "2",
          franchiseId: 1,
          id: 28,
        },
        jwt: "eyJpYXQiOjE3Mjg1MTMwMzEsImV4cCI6MTcyODU5OTQzMSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJiYjc3NSIsIm5hbWUiOiJCcmVudCBCaXNob2ZmIn0sImRpbmVyIjp7ImlkIjoyLCJuYW1lIjoiS2FpIENoZW4iLCJlbWFpbCI6ImRAand0LmNvbSJ9LCJvcmRlciI6eyJpdGVtcyI6W3sibWVudUlkIjoyLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjAwMzh9LHsibWVudUlkIjoyLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjAwMzh9XSwic3RvcmVJZCI6IjIiLCJmcmFuY2hpc2VJZCI6MSwiaWQiOjI4fX0.sfz7oUDtdTEa-4SBoQkX1lOPBKHzu3RHhjPxHrQ7g-7vKu7MnmVqvk1Lg7TrI8rRe3sz-7Fz1XCnUa1zPa8K-6oKpI5nm9yxsODrdHqUz2D6duSswZxTn7wGln0XBPEwARcCB5VZw2nu6tifF1CoSz58za_5X_C1cdjj8LCKjO8NccrdTiW8xXEXAAs5IIxVTnfSfT7uAybW2sTo319CoDbHOHwVUP6bjfzYGP-138VNGzctklaVshm7Lq2IeIH9a33vEhMh1os5Exg0ff3vLoVC9ZARKFpi5No1wopDq07GG3G9PpX_KnFjmrMa4ww_yG0rzOCMwH50vZZVrMbeGy8CDxCceBHZP5DpL5Zkd6ZJkT_oLzNvMPSyqsvPOmJCLLSq3YBHr7P03ZRZzXenorl_uIw_t3_oZfh3nKXQDTgj9ewp3p9AkYs3m911mvTFLK7s_KtsclVfXAkevJaJ3FZUnVc6FsRm-JDYmrMKevYX6Tg4t1zvPm8S3QiI0JZalRTKtjZNH7lEiClgPSqF2xTETfZl_1z584_OL4f4SlFOGrPmQanFZh9kHlxfLuuft0nLdBWnTEJib7TeB-xIA1hEld6ZIOViT5aaNzmrC9JfhUPW3gBxK9CRdQwQys2ypPmtnFndCF-SXJenbNF_N3jDizKitev9xLvds1JWPuo",
      };

      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    }

    if (route.request().method() === "GET") {
      const afterOrderRes = {
        dinerId: 2,
        orders: [
          {
            id: 2,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-08T22:44:14.000Z",
            items: [
              {
                id: 2,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 3,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:05:43.000Z",
            items: [
              {
                id: 3,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 4,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:08:35.000Z",
            items: [
              {
                id: 4,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 5,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 5,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:09:24.000Z",
            items: [
              {
                id: 6,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 7,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 6,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:10:08.000Z",
            items: [
              {
                id: 8,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 9,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 7,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:11:26.000Z",
            items: [
              {
                id: 10,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 8,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:13:36.000Z",
            items: [
              {
                id: 11,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 12,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 9,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:14:07.000Z",
            items: [
              {
                id: 13,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 14,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 10,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:15:12.000Z",
            items: [
              {
                id: 15,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 16,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
          {
            id: 11,
            franchiseId: 1,
            storeId: 2,
            date: "2024-10-09T01:16:00.000Z",
            items: [
              {
                id: 17,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
              {
                id: 18,
                menuId: 2,
                description: "Veggie",
                price: 0.0038,
              },
            ],
          },
        ],
        page: 1,
      };
      expect(route.request().method()).toBe("GET");
      await route.fulfill({ json: afterOrderRes });
    }
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Order" }).click();
  await page.getByRole("link", { name: "Order" }).click();
  await page.getByRole("link", { name: "Order" }).click();
  await page.getByRole("combobox").selectOption("2");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.locator("main")).toContainText("total: 0.008 ₿");

  await page.getByRole("link", { name: "KC" }).click();
  await expect(page.locator("main")).toContainText("0.008 ₿");
});

test("docs", async ({ page }) => {
  await page.route("*/**/api/docs", async (route) => {
    const docsRes = {
      version: "20240926.195142",
      endpoints: [
        {
          method: "POST",
          path: "/api/auth",
          description: "Register a new user",
          example:
            'curl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}\' -H \'Content-Type: application/json\'',
          response: {
            user: {
              id: 2,
              name: "pizza diner",
              email: "d@jwt.com",
              roles: [
                {
                  role: "diner",
                },
              ],
            },
            token: "tttttt",
          },
        },
        {
          method: "PUT",
          path: "/api/auth",
          description: "Login existing user",
          example:
            'curl -X PUT localhost:3000/api/auth -d \'{"email":"a@jwt.com", "password":"admin"}\' -H \'Content-Type: application/json\'',
          response: {
            user: {
              id: 1,
              name: "常用名字",
              email: "a@jwt.com",
              roles: [
                {
                  role: "admin",
                },
              ],
            },
            token: "tttttt",
          },
        },
        {
          method: "PUT",
          path: "/api/auth/:userId",
          requiresAuth: true,
          description: "Update user",
          example:
            'curl -X PUT localhost:3000/api/auth/1 -d \'{"email":"a@jwt.com", "password":"admin"}\' -H \'Content-Type: application/json\' -H \'Authorization: Bearer tttttt\'',
          response: {
            id: 1,
            name: "常用名字",
            email: "a@jwt.com",
            roles: [
              {
                role: "admin",
              },
            ],
          },
        },
        {
          method: "DELETE",
          path: "/api/auth",
          requiresAuth: true,
          description: "Logout a user",
          example: "curl -X DELETE localhost:3000/api/auth -H 'Authorization: Bearer tttttt'",
          response: {
            message: "logout successful",
          },
        },
        {
          method: "GET",
          path: "/api/order/menu",
          description: "Get the pizza menu",
          example: "curl localhost:3000/api/order/menu",
          response: [
            {
              id: 1,
              title: "Veggie",
              image: "pizza1.png",
              price: 0.0038,
              description: "A garden of delight",
            },
          ],
        },
        {
          method: "PUT",
          path: "/api/order/menu",
          requiresAuth: true,
          description: "Add an item to the menu",
          example:
            'curl -X PUT localhost:3000/api/order/menu -H \'Content-Type: application/json\' -d \'{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }\'  -H \'Authorization: Bearer tttttt\'',
          response: [
            {
              id: 1,
              title: "Student",
              description: "No topping, no sauce, just carbs",
              image: "pizza9.png",
              price: 0.0001,
            },
          ],
        },
        {
          method: "GET",
          path: "/api/order",
          requiresAuth: true,
          description: "Get the orders for the authenticated user",
          example: "curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'",
          response: {
            dinerId: 4,
            orders: [
              {
                id: 1,
                franchiseId: 1,
                storeId: 1,
                date: "2024-06-05T05:14:40.000Z",
                items: [
                  {
                    id: 1,
                    menuId: 1,
                    description: "Veggie",
                    price: 0.05,
                  },
                ],
              },
            ],
            page: 1,
          },
        },
        {
          method: "POST",
          path: "/api/order",
          requiresAuth: true,
          description: "Create a order for the authenticated user",
          example:
            'curl -X POST localhost:3000/api/order -H \'Content-Type: application/json\' -d \'{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}\'  -H \'Authorization: Bearer tttttt\'',
          response: {
            order: {
              franchiseId: 1,
              storeId: 1,
              items: [
                {
                  menuId: 1,
                  description: "Veggie",
                  price: 0.05,
                },
              ],
              id: 1,
            },
            jwt: "1111111111",
          },
        },
        {
          method: "GET",
          path: "/api/franchise",
          description: "List all the franchises",
          example: "curl localhost:3000/api/franchise",
          response: [
            {
              id: 1,
              name: "pizzaPocket",
              stores: [
                {
                  id: 1,
                  name: "SLC",
                },
              ],
            },
          ],
        },
        {
          method: "GET",
          path: "/api/franchise/:userId",
          requiresAuth: true,
          description: "List a user's franchises",
          example: "curl localhost:3000/api/franchise/4  -H 'Authorization: Bearer tttttt'",
          response: [
            {
              id: 2,
              name: "pizzaPocket",
              admins: [
                {
                  id: 4,
                  name: "pizza franchisee",
                  email: "f@jwt.com",
                },
              ],
              stores: [
                {
                  id: 4,
                  name: "SLC",
                  totalRevenue: 0,
                },
              ],
            },
          ],
        },
        {
          method: "POST",
          path: "/api/franchise",
          requiresAuth: true,
          description: "Create a new franchise",
          example:
            'curl -X POST localhost:3000/api/franchise -H \'Content-Type: application/json\' -H \'Authorization: Bearer tttttt\' -d \'{"name": "pizzaPocket", "admins": [{"email": "f@jwt.com"}]}\'',
          response: {
            name: "pizzaPocket",
            admins: [
              {
                email: "f@jwt.com",
                id: 4,
                name: "pizza franchisee",
              },
            ],
            id: 1,
          },
        },
        {
          method: "DELETE",
          path: "/api/franchise/:franchiseId",
          requiresAuth: true,
          description: "Delete a franchises",
          example:
            "curl -X DELETE localhost:3000/api/franchise/1 -H 'Authorization: Bearer tttttt'",
          response: {
            message: "franchise deleted",
          },
        },
        {
          method: "POST",
          path: "/api/franchise/:franchiseId/store",
          requiresAuth: true,
          description: "Create a new franchise store",
          example:
            "curl -X POST localhost:3000/api/franchise/1/store -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"name\":\"SLC\"}' -H 'Authorization: Bearer tttttt'",
          response: {
            id: 1,
            franchiseId: 1,
            name: "SLC",
          },
        },
        {
          method: "DELETE",
          path: "/api/franchise/:franchiseId/store/:storeId",
          requiresAuth: true,
          description: "Delete a store",
          example:
            "curl -X DELETE localhost:3000/api/franchise/1/store/1  -H 'Authorization: Bearer tttttt'",
          response: {
            message: "store deleted",
          },
        },
      ],
      config: {
        factory: "https://pizza-factory.cs329.click",
        db: "127.0.0.1",
      },
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: docsRes });
  });

  await page.goto("http://localhost:5173/docs");
  await expect(page.locator("main")).toContainText(
    'curl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.'
  );
});
