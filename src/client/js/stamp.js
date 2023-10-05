const getCourseListFetch = async() => {
    const response = await fetch("/api/courses") 
    const result = await response.json();
    courseListInfo = result;
}

getCourseListFetch().then(() => {
    const stampContainer = document.querySelector('.stamp-container')
    const achievement = document.querySelector('#achievement')
    const levelNum = document.querySelector('.level-num')
    const barGraph = document.querySelector('.bar-graph')

    let completedStamps = courseListInfo.filter(function(obj) {
        return obj.users_course_id !== null;
    });

    let stampQuantity = completedStamps.length;

    barGraph.style.width = `${stampQuantity * (100/9)}%`

    levelNum.innerHTML = stampQuantity
    achievement.innerHTML =  `스탬프 ${courseListInfo.length}개 중 ${stampQuantity}개 획득!`
    
    let stampLists = ''

    courseListInfo.forEach((course, i) => {
        stampLists += `<div class='stamp'>
                            <img class="stamp-img" src="../file/mission_${course.users_course_id? '' : 'not_'}completed_stamp.png" alt=""> 
                            <div class="stamp-name">${course.course_name}</div>
                        </div>`
    })

    stampContainer.innerHTML = stampLists;
})