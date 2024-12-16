import { useState } from "react";
import "./App.css";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      age
      name
      isMarried
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      age
      name
      isMarried
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      name
    }
  }
`;

function App() {
  const [newUser, setNewUser] = useState({ name: "", age: "" });

  const { data: getUsersData, error: getUsersError, loading: getUsersLoading } = useQuery(GET_USERS);
  const { data: getUserByIdData, error: getUserByIdError, loading: getUserByIdLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: "2" },
  });

  const [createUser, { loading: createUserLoading }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.age) return alert("Please fill in all fields.");
    try {
      await createUser({
        variables: {
          name: newUser.name,
          age: Number(newUser.age),
          isMarried: false,
        },
      });
      setNewUser({ name: "", age: "" }); // Reset form
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  if (getUsersLoading) return <p>Data loading...</p>;
  if (getUsersError) return <p>Error: {getUsersError.message}</p>;

  return (
    <div>
      <div>
        <input
          placeholder="Name..."
          value={newUser.name}
          onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          placeholder="Age..."
          type="number"
          value={newUser.age}
          onChange={(e) => setNewUser((prev) => ({ ...prev, age: e.target.value }))}
        />
        <button onClick={handleCreateUser} disabled={createUserLoading}>
          {createUserLoading ? "Creating..." : "Create User"}
        </button>
      </div>

      <div>
        {getUserByIdLoading ? (
          <p>Loading user...</p>
        ) : getUserByIdError ? (
          <p>Error: {getUserByIdError.message}</p>
        ) : (
          <div>
            <h1>Chosen User:</h1>
            <p>{getUserByIdData.getUserById.name}</p>
            <p>{getUserByIdData.getUserById.age}</p>
          </div>
        )}
      </div>

      <h1>Users</h1>
      <div>
        {getUsersData.getUsers.map((user) => (
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Age: {user.age}</p>
            <p>Is this user married: {user.isMarried ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;