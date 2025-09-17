"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [teams, setTeams] = useState([]);
  const fetchTeams = async () => {
    console.log("test!");
  };
  useEffect(() => {
    fetchTeams();
  }, []);
  return <div>Teams</div>;
}
