import Room from '../../models/Room.js';
import UserHistory from '../../models/UserHistory.js';
import User from '../../models/User.js';
import similarity from 'compute-cosine-similarity';

/**
 * 1. get all userhistory records and all rooms
 * 2. arrange it in an array like this
        userHistoryArray = [{userId: user1, rooms: [room1, room2, ...]}, {userId: user2, rooms: [room1, room2, ...]}, ...]
 * 3. filter out userhistory of userId from input as current_userhistory
 * 4. loop through userhistories and calculate cosine similarity of current_userhistory with every userhistory and fill array cosine_similarities
        cosine_similarities = [{user2: 0.5}, {user3: 0.6}, {user4: 0.4}, {user5: 0.3}, ...]
 * 5. get rooms of top 3 users with highest cosine_similarities eg: user2, user3 and user4 from above example. Put it into recommendations array in order of highest cosine_similarities
        eg: recommendation from user2 : room2, user3: room3, user4: room4 (can be multiple rooms from one user)
        So based on cosine similarities of user2, user3 and user4
        recommendedRoomIds = [room3, room2, room4]
 * 6. filter out rooms that are already in current user history from recommendations
 * 7. get details of room from recommendations and return it
 *      recommendations = [{roomId: room3, roomName: 'room3', ...}, {roomId: room2, roomName: 'room2', ...}, {roomId: room4, roomName: 'room4', ...}]
 * 8. return recommendations
 */

/*declares an asynchronous function named roomRecommendations
    userId: The unique identifier of the user for whom room recommendations are being generated
    recommendUsersCount: The number of similar users to consider for generating recommendations (e.g., top 3 most similar users)*/ 
export const roomRecommendations = async(userId, pickedUserId = '') => { 
    
/* Ensures the userId is in string format*/
     userId = userId.toString();


    // 1. get all userhistory records and all rooms, fetches all records from the UserHistory and room collection in the database
    const userHistories = await UserHistory.find();
    const rooms = await Room.find(); 

    // 2. arrange it in an array like this
    //     userHistoryArray = [{userId: user1, rooms: [room1, room2, ...]}, {userId: user2, rooms: [room1, room2, ...]}, ...]

    // esma user history array banuna lai, extracts a list of all unique userId values from the userHistories dataset 

    /*
    Loops through userHistories and extracts the userId for each record as a string
    Removes duplicates, leaving only unique user IDs - creates new set esma ani arko ma chai set lai array ma lagcha pheri
    Converts the Set back into an array

    esto khale example
    userHistories = [
  { userId: 1, roomId: 'room1' },
  { userId: 1, roomId: 'room2' },
  { userId: 2, roomId: 'room3' },
];
Result: ['1', '1', '2'];

*/ 

    let uniqueUsers = [...new Set(userHistories.map(uh => uh.userId.toString()))];

    // Create an empty array to store grouped user-room data
    let userHistoryArray = [];

// yo loop ma chai, Iterates over each unique user ID from the uniqueUsers array
// tyo filter le chai, filters the userHistories array to find all records where the userId matches the current user in the loop
/*

Example: For userId = '1'
[
  { userId: 1, roomId: 'room1' },
  { userId: 1, roomId: 'room2' },
];

*/

//extract ma chai Maps over the filtered results to extract the roomId of each record and convert it to a string
//['room1', 'room2'];
//push garda, create object containing the userId and their associated rooms, then adds it to the userHistoryArray

    for(let userId of uniqueUsers) {
        let rooms = userHistories.filter(uh => uh.userId.toString() === userId).map(uh => uh.roomId.toString());
        userHistoryArray.push({userId: userId, rooms});
    }

    /* 
    esto huncha final product 
    userHistoryArray = [
    { userId: '1', rooms: ['room1', 'room2'] },
    { userId: '2', rooms: ['room3'] }
];
*/

    // * 3. filter out userhistory of userId from input as current_userhistory

    //Locate the history object in userHistoryArray for the user whose ID matches userId
    //If found, current_userhistory contains the user's history (e.g., { userId: '1', rooms: ['room1', 'room2'] }).
    //If no match is found, current_userhistory will be undefined.
    let current_userhistory = userHistoryArray.find(uh => uh.userId.toString() === userId);

    // new user will have no history, return empty in this case, empty array chai return huncha
    if(current_userhistory.length == 0) {
        return [];
    }
    //esle ta error dincha, user history nai chaina bhane ta, can be seen site mai ^^^

    //Filter out the current user's history from the list of all user histories, Loops through userHistoryArray and keeps only the histories of users whose userId is not equal to the input userId
    // afno ensure garchi ki the current user's history is not compared with itself during cosine calculation

    userHistoryArray = userHistoryArray.filter(uh => uh.userId.toString() !== userId);

    // * 4. loop through userhistories and calculate cosine similarity of current_userhistory with every userhistory and fill array cosine_similarities
    //     cosine_similarities = [{user2: 0.5}, {user3: 0.6}, {user4: 0.4}, {user5: 0.3}, ...]

     //This will store objects where each key is a user ID and the value is their cosine similarity score compared to the current user
    let cosine_similarities = [];

    //Loop through every user history (uh) in userHistoryArray, Each thing is an object like { userId: '2', rooms: ['room3'] }
    for(let uh of userHistoryArray) {

        // cosine similarity only works for integer arrays, so mapping the string roomIds to integer indexes
        let roomIdToIndex = {};
        let index = 0;
        let allRooms = [...new Set([...current_userhistory.rooms, ...uh.rooms])];
        allRooms.forEach(roomId => {
            if (!roomIdToIndex[roomId]) {
                roomIdToIndex[roomId] = index++;
            }
        });


        //Converts room IDs in both histories into arrays of integers using the roomIdToIndex mapping
        /*
currentUserHistoryRoomsArrayMapped = [0, 1]; // ['room1', 'room2']
userHistoryRoomsArrayMapped = [1, 2];       // ['room2', 'room3']


         */
        let currentUserHistoryRoomsArrayMapped = current_userhistory.rooms.map(roomId => roomIdToIndex[roomId]);
        let userHistoryRoomsArrayMapped = uh.rooms.map(roomId => roomIdToIndex[roomId]);

        // cosine similarity arrays must be of same length
       /*
       currentUserHistoryRoomsArrayMapped = [0, 1];
userHistoryRoomsArrayMapped = [1, 2];

// After equalization
arrays.smallerArray = [0, 1, 0]; // padded with a zero
arrays.greaterArray = [1, 2, 0];


       
       */

        let arrays = equalizeTwoArrays(currentUserHistoryRoomsArrayMapped, userHistoryRoomsArrayMapped);
// Uses the similarity function (from compute-cosine-similarity) to calculate the cosine similarity between the two arrays
//formula=dot product/magnittude of each array
        let cosine_similarity = similarity(arrays.smallerArray, arrays.greaterArray);

        //Adds an object to the cosine_similarities array where
        //Key: uh.userId (the other user's ID), Value: The cosine similarity score
        /*
        eg
        cosine_similarities = [
    { '2': 0.5 },
    { '3': 0.6 },
    { '4': 0.4 }
];

        
        */
        cosine_similarities.push({[uh.userId]: cosine_similarity});
    }

    // * 5. get rooms of top 3 users with highest cosine_similarities eg: user2, user3 and user4 from above example. Put it into recommendations array in order of highest cosine_similarities
    //     eg: recommendation from user2 : room2, user3: room3, user4: room4 (can be multiple rooms from one user)
    //     So based on cosine similarities of user2, user3 and user4
    //     recommendations = [room3, room2, room4]


    /*

    Arrange the cosine_similarities array in descending order based on similarity values.

    How?

    Object.values(b)[0] gets the similarity value for user b
    Object.values(a)[0] gets the similarity value for user a
    Subtracts these values to sort in descending order (higher similarity first)

     */
    cosine_similarities.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
    //Logs the sorted cosine similarities for debugging and analysis
    console.log(`\n\nCosine similarities for user: ${userId}, \n ${JSON.stringify(cosine_similarities)}\n\n`);     //LOGS INTO THE CONSOLE 
    //This array will store room IDs collected from the top similar users
    let recommendedRoomIds = [];
    //Gather the room IDs from the recommendUsersCount most similar users
    
    let userHistory;
    if(!pickedUserId) {
        let cosine_similarity = cosine_similarities[0];
        //Retrieves the user ID from the current similarity object
        let userId = Object.keys(cosine_similarity)[0];
        //Searches userHistoryArray for the user object matching the userId
        userHistory = userHistoryArray.find(uh => uh.userId === userId);
        //Appends all room IDs from the user's history to recommendedRoomIds
        recommendedRoomIds.push(...userHistory.rooms);
    } else {
        userHistory = userHistoryArray.find(uh => uh.userId === pickedUserId);    
    }

    recommendedRoomIds.push(...userHistory.rooms);
    
    // * 6. filter out rooms that are already in current user history from recommendations
    recommendedRoomIds = recommendedRoomIds.filter(room => !current_userhistory.rooms.includes(room));
    
    // * 7. get details of room from recommendations and return it
    // *    recommendations = [{roomId: room3, roomName: 'room3', ...}, {roomId: room2, roomName: 'room2', ...}, {roomId: room4, roomName: 'room4', ...}]
    //Creates an empty array to store the recommended room details.
    let recommendations = [];
    //Loops through each roomId in the recommendedRoomIds array, which contains room IDs to recommend
    for(let roomId of recommendedRoomIds) {
        //Searches the rooms array (which contains all room details from the database) for a room whose _id matches the current roomId
        //  Uses .toString() to ensure both _id and roomId are strings for comparison
        let room = rooms.find(room => room._id.toString() === roomId);
        //room exists (i.e., a matching room was found in rooms, The room is not already in the recommendations array
        if(room && recommendations.filter(r => r._id.toString() === room._id.toString()).length < 1) {
            //Adds the room object to the recommendations array
            recommendations.push(room);
        }
    }
    
    // order recommendations based on title, to the final list of recommended rooms (recommendations) alphabetically based on their title
    recommendations = recommendations.sort((a, b) => a.title.localeCompare(b.title));

    let mappedCosineSimilarities = await mapCosineSimilarities(cosine_similarities.slice(0,10));

    // * 8. return recommendations, final list with id, title rooms etc
    return {recommendations, similarity: mappedCosineSimilarities};
};

/**
 * 1. get all userhistory records and all rooms
 * 2. get details of rooms that are in userhistory of userId
 * 3. return userHistories
 */
//This function fetches all the rooms that a specific user has interacted with, based on their history in the UserHistory collection
export const userHistories = async(userId) => {
    // * 1. get all userhistory records and all rooms
    //Fetches all history records for the user whose ID matches userId
    const userHistories = await UserHistory.find({userId: userId}).sort({ createdAt: -1 });
    //Fetches all available room records from the Room collection
    const rooms = await Room.find();

    // * 2. return details of rooms that are in userhistory of userId
    //This array will store the details of the rooms that the user has interacted with.
    let userHistoryRooms = [];
    //For each history entry, find the corresponding room in the rooms array where the roomId matches _id
    //Loops through all entries in the userHistories array
    for(let userHistory of userHistories) {
        //Use the roomId from the userHistory to find the corresponding room in the rooms array
        //Condition: _id of a room in the rooms collection must match the roomId of the userHistory
        //Convert both IDs to strings for a reliable comparison.
        let room = rooms.find(r => r._id.toString() === userHistory.roomId.toString());
        //check for duoplicates
        if(room && userHistoryRooms.filter(uh => uh?._id?.toString() === room?._id?.toString()).length < 1) {
            userHistoryRooms.push(room);
        }
    }

    // * 3. return userHistories
    //After collecting and filtering the room details, return the array userHistoryRooms
    return userHistoryRooms;
};
//array lai equal banauna lai gareko, napugeko array ma last ma extra zero thapdine to make it comaparable
/**
 * function to make length of two arrays equal by adding random integers to the smaller array
 * @param {*} array 
 * @param {*} array2 
 * @returns object with smallerArray and greaterArray
 */
const equalizeTwoArrays = (array, array2) => {
    let smallerArray = array.length < array2.length ? array : array2;
    let greaterArray = array.length < array2.length ? array2 : array;

    while (smallerArray.length < greaterArray.length) {
        smallerArray.push(0);
    }
    
    return {smallerArray, greaterArray};
}

const mapCosineSimilarities = async (cosineSimilarities) => {
    const userIds = cosineSimilarities.map(obj => Object.keys(obj)[0]);
    const users = await User.find();

    let filteredUsers = users.filter(u => userIds.includes(u._id.toString()));

    let mappedSimilarities = [];
    for(let similarity of cosineSimilarities) {
        let id = Object.keys(similarity)[0];
        let mappedSimilarity = {
            userId : id,
            name : filteredUsers.find(u => u._id.toString() === id).name,
            similarity : similarity[id]
        }
        mappedSimilarities.push(mappedSimilarity)
    };

    return mappedSimilarities;
}