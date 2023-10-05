import db from "../config/db"

export const getCourseList = async (request, response) => {
// 로그인했는지 여부를 판단한다 그래서 유저 id를 가져온다 로그인 안했으면 null
const userId = request.user ? request.user.user_id : null;
// 데이터베이스에서 코스 정보와 방문여부를 가져온다.
const QUERY = `
    SELECT c.*, uc.users_course_id 
    FROM course c 
    LEFT JOIN users_course uc 
    ON c.course_id = uc.course_id
    AND uc.user_id = ?`

  const courseList = await db.execute(QUERY, [1]).then((result) => result[0]);
  
  response.json(courseList);
}

/* 
    controller => service (중요한 처리들) -> repository
*/