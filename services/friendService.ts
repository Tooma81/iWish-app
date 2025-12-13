import { supabase } from '@/utils/supabase';

// "profiles" tabelist päritakse "username"
export async function searchUsersByUsername(searchText: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `%${searchText}%`) // case-insensitive LIKE
    .limit(10); // Limit tulemused

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }
  return data;
}

// Sõbra ettepaneku saatmine (luuakse pending kirje)
export async function sendFriendRequest(friendId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Kasutaja pole sisse logitud.");
  }

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('friends')
    .insert([
      { 
        user_id: userId, 
        friend_id: friendId, 
        status: 'pending' // Esialgne staatus
      },
    ]);

  if (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
  return data;
}

// Andmetüübi defineerimine paremaks tüübiks
export type Friend = {
  id: number; // friends tabeli ID (kirje eemaldamiseks)
  profile_id: string; // Sõbra UUID
  username: string; // Sõbra kasutajanimi
  relationship: string; // Näiteks 'BF', 'Granny', 'sister' (teie disaini järgi tuleb see maybe profiles tabelist või rakendusesiseselt defineerida/salvestada)
  avatar_url: string | null;
  status: 'pending' | 'accepted' | 'rejected';
};

/**
 * Toob sisse logitud kasutaja kõik sõprussuhted.
 * Tagastab listi, kus iga sõber on profiiliandmetega.
 */
export async function fetchFriendsList(): Promise<Friend[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("Autentimine ebaõnnestus.");
  }

  const currentUserId = userData.user.id;

  // Küsime friends tabelist kirjed, kus oleme kas user_id või friend_id
  const { data: relations, error } = await supabase
    .from('friends')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      // Liidame 'profiles' tabeli, et saada vastaspoole andmed
      profiles_user_id: user_id (id, username, avatar_url),
      profiles_friend_id: friend_id (id, username, avatar_url)
    `)
    .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

  if (error) {
    console.error('Error fetching friends list:', error);
    throw error;
  }

  // Tulemuste töötlemine ja standardiseerimine
  const friends: Friend[] = relations.map((rel: any) => {
    // Teeme kindlaks, kumb on SÕBER (vastaspool)
    const isCurrentUserInitiator = rel.user_id === currentUserId;
    
    // Profiilid, mis vastavad rel.user_id ja rel.friend_id (automaatselt Supabase poolt liidetud)
    const friendProfileData = isCurrentUserInitiator 
      ? rel.profiles_friend_id 
      : rel.profiles_user_id;

    // Teie disainis on "Relationship" (nt. "Granny", "BF"). 
    // See eeldab, et suhe on salvestatud kusagil, nt. profiilide tabelis, või tuleb seda käsitsi lisada.
    // Praegu kasutame 'status' + 'username' andmeid.
    const relationshipLabel = rel.status === 'pending' 
      ? 'Ootab kinnitust' 
      : (isCurrentUserInitiator ? 'Sõber (saatsin)' : 'Sõber (vastu võetud)'); // Placeholder

    return {
      id: rel.id,
      profile_id: friendProfileData.id,
      username: friendProfileData.username,
      avatar_url: friendProfileData.avatar_url,
      relationship: relationshipLabel,
      status: rel.status,
    } as Friend;
  });

  return friends;
}

/**
 * Võtame vastu sõpruse kutse
 * @param friendshipId - Kirje ID 'friends' tabelis.
 */
export async function acceptFriendRequest(friendshipId: number) {
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId) // Uuendame õiget kirjet
    .select() // See tagastab uuendatud andmed

  if (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
  return data;
}

/**
 * Eemaldab sõprussuhte (kustutab kirje 'friends' tabelist).
 * @param friendshipId - Kirje ID 'friends' tabelis.
 */
export async function removeFriend(friendshipId: number) {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
  // Kustutamise korral tagastame lihtsalt 'true' või 'void'
  return true; 
}