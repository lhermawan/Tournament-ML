import { calculateStandings, generateBalancedTeams, generateRoundRobin } from "@/lib/tournament";
import { Match, Player } from "@/lib/types";

export const demoPlayers: Player[] = [
  ["1", "Lucky Pratama", "Lucky", "123456", "0811111111", "Aptika", "Mythic", "Jungler", "Gold Lane"],
  ["2", "Budi Santoso", "Budi", "223456", "0822222222", "IKP", "Legend", "Mid Lane", "Roamer"],
  ["3", "Andi Saputra", "Andi", "323456", "0833333333", "Statistik", "Epic", "Gold Lane", "Mid Lane"],
  ["4", "Rian Maulana", "Rian", "423456", "0844444444", "Sekretariat", "Legend", "EXP Lane", "Jungler"],
  ["5", "Dani Firmansyah", "Dani", "523456", "0855555555", "Persandian", "Epic", "Roamer", "EXP Lane"],
  ["6", "Nadia Putri", "Nadia", "623456", "0866666666", "Aptika", "Mythic", "Mid Lane", "Gold Lane"],
  ["7", "Fajar Hidayat", "Fajar", "723456", "0877777777", "IKP", "Legend", "Gold Lane", "Jungler"],
  ["8", "Sinta Ayu", "Sinta", "823456", "0888888888", "Statistik", "Grandmaster", "EXP Lane", "Roamer"],
  ["9", "Dimas Arif", "Dimas", "923456", "0899999999", "Sekretariat", "Epic", "Roamer", "Mid Lane"],
  ["10", "Raka Wijaya", "Raka", "103456", "0810101010", "Persandian", "Legend", "Jungler", "EXP Lane"],
  ["11", "Maya Lestari", "Maya", "113456", "0812121212", "Aptika", "Epic", "Mid Lane", "Roamer"],
  ["12", "Yoga Permana", "Yoga", "123457", "0813131313", "IKP", "Mythic", "Gold Lane", "Mid Lane"],
  ["13", "Tegar Nugraha", "Tegar", "133456", "0814141414", "Statistik", "Master", "EXP Lane", "Gold Lane"],
  ["14", "Putri Amelia", "Putri", "143456", "0815151515", "Sekretariat", "Legend", "Roamer", "EXP Lane"],
  ["15", "Ilham Fauzi", "Ilham", "153456", "0816161616", "Persandian", "Epic", "Jungler", "Mid Lane"],
  ["16", "Rizky Akbar", "Rizky", "163456", "0817171717", "Aptika", "Grandmaster", "Mid Lane", "Jungler"],
  ["17", "Citra Dewi", "Citra", "173456", "0818181818", "IKP", "Legend", "Gold Lane", "Roamer"],
  ["18", "Bayu Prasetyo", "Bayu", "183456", "0819191919", "Statistik", "Mythic", "EXP Lane", "Mid Lane"],
  ["19", "Hana Salsabila", "Hana", "193456", "0820202020", "Sekretariat", "Epic", "Roamer", "Gold Lane"],
  ["20", "Arman Hakim", "Arman", "203456", "0821212121", "Persandian", "Legend", "Jungler", "EXP Lane"]
].map(([id, name, nickname, mlId, phone, unit, rank, mainRole, secondRole]) => ({
  id,
  name,
  nickname,
  mlId,
  phone,
  unit,
  rank,
  mainRole,
  secondRole,
  verified: true
})) as Player[];

export const demoTeams = generateBalancedTeams(demoPlayers);

const baseSchedule = generateRoundRobin(demoTeams);

export const demoMatches: Match[] = baseSchedule.map((match, index) => {
  if (index > 4) return match;
  const winnerId = index % 2 === 0 ? match.teamAId : match.teamBId;
  return {
    ...match,
    winnerId,
    scoreA: winnerId === match.teamAId ? 1 : 0,
    scoreB: winnerId === match.teamBId ? 1 : 0,
    mvp: demoTeams[index % demoTeams.length]?.members[0]?.player.nickname
  };
});

export const demoStandings = calculateStandings(demoTeams, demoMatches);
