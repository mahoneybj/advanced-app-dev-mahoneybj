/**
 * @jest-environment jsdom
 */
//@ts-ignore
window.setImmediate = window.setTimeout;
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getDoc, deleteDoc, updateDoc, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

describe("Firestore security rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "online-poker-b9091",
      firestore: {
        rules: readFileSync("firestore.rules", "utf-8"),
        host: "localhost",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe("Games collection rules", () => {
    const gameData = {
      ownerUID: "user1",
      gameState: "Waiting",
      playerCount: 1,
      deck: [],
      deckIndex: 0,
    };

    describe("Read operations", () => {
      test("should allow authenticated users to read games", async () => {
        const authenticatedUser = testEnv
          .authenticatedContext("user1")
          .firestore();

        await assertSucceeds(
          getDoc(doc(authenticatedUser, "games/test-game-1")),
        );
      });

      test("should deny unauthenticated users from reading games", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          getDoc(doc(unauthenticatedUser, "games/test-game-1")),
        );
      });
    });

    describe("Create operations", () => {
      test("should allow authenticated user to create game when they are the owner", async () => {
        const authenticatedUser = testEnv
          .authenticatedContext("user1")
          .firestore();

        await assertSucceeds(
          setDoc(doc(authenticatedUser, "games/test-game-1"), gameData),
        );
      });

      test("should deny authenticated user from creating game when they are not the owner", async () => {
        const authenticatedUser = testEnv
          .authenticatedContext("user2")
          .firestore();

        await assertFails(
          setDoc(doc(authenticatedUser, "games/test-game-1"), gameData),
        );
      });

      test("should deny unauthenticated users from creating games", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          setDoc(doc(unauthenticatedUser, "games/test-game-1"), gameData),
        );
      });
    });

    describe("Update operations", () => {
      beforeEach(async () => {
        // Game with 2 members
        const ownerUser = testEnv.authenticatedContext("user1").firestore();
        await setDoc(doc(ownerUser, "games/test-game-1"), gameData);
        await setDoc(doc(ownerUser, "games/test-game-1/members/user1"), {
          displayName: "User 1",
          cards: [],
        });
        await setDoc(doc(ownerUser, "games/test-game-1/members/user2"), {
          displayName: "User 2",
          cards: [],
        });
      });

      test("should allow game members to update game details", async () => {
        const memberDb = testEnv.authenticatedContext("user2").firestore();

        await assertSucceeds(
          updateDoc(doc(memberDb, "games/test-game-1"), {
            gameState: "In Progress",
          }),
        );
      });

      test("should deny non-members from updating game details", async () => {
        const nonMemberDb = testEnv.authenticatedContext("user3").firestore();

        await assertFails(
          updateDoc(doc(nonMemberDb, "games/test-game-1"), {
            gameState: "In Progress",
          }),
        );
      });

      test("should deny unauthenticated users from updating games", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          updateDoc(doc(unauthenticatedUser, "games/test-game-1"), {
            gameState: "In Progress",
          }),
        );
      });
    });

    describe("Delete operations", () => {
      beforeEach(async () => {
        // Setup: Create a game
        const ownerUser = testEnv.authenticatedContext("user1").firestore();
        await setDoc(doc(ownerUser, "games/test-game-1"), gameData);
      });

      test("should allow game owner to delete their game", async () => {
        const ownerUser = testEnv.authenticatedContext("user1").firestore();

        await assertSucceeds(deleteDoc(doc(ownerUser, "games/test-game-1")));
      });

      test("should deny non-owners from deleting games", async () => {
        const nonownerUser = testEnv.authenticatedContext("user2").firestore();

        await assertFails(deleteDoc(doc(nonownerUser, "games/test-game-1")));
      });

      test("should deny unauthenticated users from deleting games", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          deleteDoc(doc(unauthenticatedUser, "games/test-game-1")),
        );
      });
    });
  });

  describe("Members subcollection rules", () => {
    const memberData = {
      displayName: "Test User",
      cards: ["2H", "3S", "4D", "5C", "6H"],
    };

    beforeEach(async () => {
      // Game
      const ownerUser = testEnv.authenticatedContext("user1").firestore();
      await setDoc(doc(ownerUser, "games/test-game-1"), {
        ownerUID: "user1",
        gameState: "Waiting",
        playerCount: 1,
      });
    });

    describe("Read operations", () => {
      test("should allow authenticated users to read member data", async () => {
        const authenticatedUser = testEnv
          .authenticatedContext("user1")
          .firestore();

        await assertSucceeds(
          getDoc(doc(authenticatedUser, "games/test-game-1/members/user2")),
        );
      });

      test("should deny unauthenticated users from reading member data", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          getDoc(doc(unauthenticatedUser, "games/test-game-1/members/user1")),
        );
      });
    });

    describe("Create operations", () => {
      test("should allow user to create their own member document", async () => {
        const userDb = testEnv.authenticatedContext("user2").firestore();

        await assertSucceeds(
          setDoc(doc(userDb, "games/test-game-1/members/user2"), memberData),
        );
      });

      test("should allow existing game member to create member documents for others", async () => {
        const user1Db = testEnv.authenticatedContext("user1").firestore();
        await setDoc(
          doc(user1Db, "games/test-game-1/members/user1"),
          memberData,
        );

        await assertSucceeds(
          setDoc(doc(user1Db, "games/test-game-1/members/user2"), memberData),
        );
      });

      test("should deny non-members from creating member documents for others", async () => {
        const nonMemberDb = testEnv.authenticatedContext("user3").firestore();

        await assertFails(
          setDoc(
            doc(nonMemberDb, "games/test-game-1/members/user2"),
            memberData,
          ),
        );
      });

      test("should deny unauthenticated users from creating member documents", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          setDoc(
            doc(unauthenticatedUser, "games/test-game-1/members/user1"),
            memberData,
          ),
        );
      });
    });

    describe("Update operations", () => {
      beforeEach(async () => {
        const user1 = testEnv.authenticatedContext("user1").firestore();
        const user2 = testEnv.authenticatedContext("user2").firestore();

        await setDoc(doc(user1, "games/test-game-1/members/user1"), memberData);
        await setDoc(doc(user2, "games/test-game-1/members/user2"), memberData);
      });

      test("should allow user to update their own member document", async () => {
        const user = testEnv.authenticatedContext("user2").firestore();

        await assertSucceeds(
          updateDoc(doc(user, "games/test-game-1/members/user2"), {
            cards: ["7H", "8S", "9D", "TC", "JH"],
          }),
        );
      });

      test("should allow existing game member to update other member documents", async () => {
        const user1 = testEnv.authenticatedContext("user1").firestore();

        await assertSucceeds(
          updateDoc(doc(user1, "games/test-game-1/members/user2"), {
            cards: ["7H", "8S", "9D", "TC", "JH"],
          }),
        );
      });

      test("should deny non-members from updating member documents", async () => {
        const nonMemberDb = testEnv.authenticatedContext("user3").firestore();

        await assertFails(
          updateDoc(doc(nonMemberDb, "games/test-game-1/members/user1"), {
            cards: ["7H", "8S", "9D", "TC", "JH"],
          }),
        );
      });

      test("should deny unauthenticated users from updating member documents", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          updateDoc(
            doc(unauthenticatedUser, "games/test-game-1/members/user1"),
            {
              cards: ["7H", "8S", "9D", "TC", "JH"],
            },
          ),
        );
      });
    });

    describe("Delete operations", () => {
      beforeEach(async () => {
        const user1 = testEnv.authenticatedContext("user1").firestore();
        const user2 = testEnv.authenticatedContext("user2").firestore();

        await setDoc(doc(user1, "games/test-game-1/members/user1"), memberData);
        await setDoc(doc(user2, "games/test-game-1/members/user2"), memberData);
      });

      test("should allow user to delete their own member document", async () => {
        const userDb = testEnv.authenticatedContext("user2").firestore();

        await assertSucceeds(
          deleteDoc(doc(userDb, "games/test-game-1/members/user2")),
        );
      });

      test("should deny user from deleting other member documents", async () => {
        const userDb = testEnv.authenticatedContext("user1").firestore();

        await assertFails(
          deleteDoc(doc(userDb, "games/test-game-1/members/user2")),
        );
      });

      test("should deny unauthenticated users from deleting member documents", async () => {
        const unauthenticatedUser = testEnv
          .unauthenticatedContext()
          .firestore();

        await assertFails(
          deleteDoc(
            doc(unauthenticatedUser, "games/test-game-1/members/user1"),
          ),
        );
      });
    });
  });
});
