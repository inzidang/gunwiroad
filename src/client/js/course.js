const locationMap = document.getElementById("location-map");
let map;
let markers = [];
let isMapDrawn = false;
let userLatitude;
let userLongitude;


// TODO 추후 사라질 수 있음
let courseListInfo = [];
let clickCourseID = 0;

// 지도 그리는 함수
const drawMap = (latitude, longtitude) => {
    const options = {
        center: new kakao.maps.LatLng(latitude, longtitude),
        level: 8
    };
    map = new kakao.maps.Map(locationMap, options)
    map.setZoomable(true);
}

// 마커를 초기화 하는 함수 (유저 마커가 새로 생길 때 기존 것을 지워버리기 위한 용도)
const deleteMarkers = () => {
    for (let i= 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
}

// 유저 마커 그리기
const addUserMarker = () => {
    let markerImage = "/file/user_marker.png";
    let markerSize = new kakao.maps.Size(36);
    const image = new kakao.maps.MarkerImage(markerImage, markerSize)

    let marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(userLatitude, userLongitude),
        image: image,
    })
    // marker.setMap(map);
    markers.push(marker)
}

// 해당 위치로 지도를 이동함
const panTo = (latitude, longitude) => {
    map.panTo(new kakao.maps.LatLng(latitude, longitude));
}

// 코스 마커 그리기
const addCourseMarker = (course) => {
    let markerImage = "/file/map_not_done.png";
    let markerSize = new kakao.maps.Size(36);
    
    if(course.users_course_id) {
        markerImage = "/file/map_complete.jpg";
        markerSize = new kakao.maps.Size(36);
        
    }

    const image = new kakao.maps.MarkerImage(markerImage, markerSize);
    const position = new kakao.maps.LatLng(course.course_latitude, course.course_longitude);
    let marker = new kakao.maps.Marker({
        map: map,
        position: position,
        title: course.course_name,
        image: image
    })

    // 코스 마커를 클릭했을 때 포커스 이동과 함께 마커 이미지에 dashed 보더가 생김
    kakao.maps.event.addListener(marker, 'click', function (){
        let position = this.getPosition();
        const courseName = this.Gb
        const courseWrap = document.querySelectorAll(".course");

        panTo(position.Ma, position.La);
        
        const markerImages = document.querySelectorAll('#location-map img[src*="/file/map"]')
        markerImages.forEach((img) => {
            if(img.title === courseName) {
                img.classList.add('focused')
                img.parentNode.classList.add('z-index')
            } else {
                img.classList.remove('focused')
                img.parentNode.classList.remove('z-index')
            }
        })

        // 마커를 클릭했을 때 코스에 대해 간략히 설명하는 창 띄우기
        let clickedMarkerIndex = courseListInfo.findIndex(obj => obj.course_name == this.Gb);
        const courseBriefSummaryLists = document.querySelectorAll('.course-brief-summary')
        const course_wrap = document.getElementById("course-wrap");
        const location_map = document.getElementById("location-map");
               
        course_wrap.classList.add('prevent-scroll')
        location_map.style.height = `calc(var(--vh, 1vh)*100 - 145px - ${course_wrap.clientHeight}px)` 
        courseBriefSummaryLists.forEach((item, i) => {
            if(i === clickedMarkerIndex) { 
                item.classList.add('show')
            } else {
                item.classList.remove('show')
            }
        })

        // 마커 클릭 시 해당 course list에도 반영하기 위함
        courseWrap.forEach((course, i) => {
            if(course.lastChild.innerText === courseName) {
                course.classList.add("on");
                clickCourseID = i + 1;
            } else {
                course.classList.remove("on");
            }
        })
    });
}

const allCourseMarker = () => {
    for (let i = 0; i < courseListInfo.length; i++) {
        addCourseMarker(courseListInfo[i]);
    }   
}


const clickCourseList = (e, courseId) => {
    // 특정 코스를 선택했을 때 마커 이미지에 dashed 보더가 생김
    const markerImages = document.querySelectorAll('#location-map img[src*="/file/map"]')
    markerImages.forEach((img, i) => {
        if(img.title.replace(/<br \/>/g, '\n') === e.target.innerText) {
            img.classList.add('focused')
            img.parentNode.classList.add('z-index')
        } else {
            img.classList.remove('focused')
            img.parentNode.classList.remove('z-index')
        }
    })

    if (clickCourseID !== courseId) {
        const courseWrap = document.querySelectorAll(".course");
        for (let i = 0; i < courseWrap.length; i++) {
            courseWrap[i].classList.remove("on");
    }
    e.currentTarget.classList.add("on");
    

    let courseLatitude;
    let courseLongitude;

    if (courseId ===0) {
        courseLatitude = userLatitude;
        courseLongitude = userLongitude;
    } else {
        let matchedCourse = courseListInfo.find(course => course.course_id === courseId);
        courseLatitude = matchedCourse.course_latitude;
        courseLongitude = matchedCourse.course_longitude;
    }
    panTo(courseLatitude, courseLongitude);
    clickCourseID = courseId;
}
}




// 현재 위치 감시 함수 -> 위치정보를 가져오는 허락이 있으면 위치정보가 갱신될 때마다 계속 정보를 가지고 함수를 실행시켜줌
const configurationLocationWatch = () => {
    if(navigator.geolocation) {
        navigator.geolocation.watchPosition((position)=>{            
            deleteMarkers();

            // console.log(position)
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;

            if(!isMapDrawn) {
                drawMap(userLatitude, userLongitude);
                allCourseMarker();
                isMapDrawn = true
            }
            addUserMarker();
            if(clickCourseID === 0 ){
                panTo(userLatitude, userLongitude)
            }
        })
    }
}

const makeNavigationHtml = () => {
    const courseWrap = document.getElementById("course-wrap");
    // console.log(courseWrap)
    let html= "";
    /* html += `<li id="myPosition" class="course on" onclick="clickCourseList(event, 0)">나의 위치</li>` */
    for (let i = 0 ; i < courseListInfo.length; i++) {
        html += `<li class="course" onclick="clickCourseList(event, ${courseListInfo[i].course_id})">`
        if (courseListInfo[i].users_course_id) {
            // console.log("들어옴")
            html += `<div class="mark-wrap"><img src="/file/complete.png" /></div>`
        }
        html += `<p>${courseListInfo[i].course_name}</p>`
        html += `<img class="course-thumbnail" src="../file/course_thumbnail_${i}.png">`
        html += `</li>`
        html += `<li class="course-brief-summary">
                    <img src="../file/left_arrow.png" class="left-arrow-btn" alt="" onclick="clickBackBtn(event)">
                    <div class="contents-wrapper">
                        <img src="../file/course_thumbnail_${i}.png" class="course-img" alt="">
                        <div>
                            <div class="title">${courseListInfo[i].course_name}</div>
                            <div class="sub_text">해발 828m 산 정산에 고랭지 채소를 주산물로 살아가는 마을</div>
                        </div>
                    </div>
                    <img src="../file/white_heart_btn.png" class="heart-btn" alt="" onClick="clickHeartBtn(event)">
                    <a href="/course/detail"><div class="view-more-btn">자세히보기</div></a>
                  </li>`
    }
    // console.log(courseListInfo);
    html += `<div class="course-popup-bar"></div>`
    // console.log(html)
    courseWrap.innerHTML = html;
}
// drawMap(35.875528, 128.681573);
// addCourseMarker();

// 코스 정보 받아온 다음에 할일 
const afterGetCourseList = () => {
    makeNavigationHtml();
    configurationLocationWatch();
}

// 백엔드 서버로 코스정보 요청
const getCourseListFetch = async() => {
    const response = await fetch("/api/courses") 
    const result = await response.json();
    courseListInfo = result;
    
    afterGetCourseList();
    makeNavigationHtml();
}

// 지도가 그려짐과 동시에 ul 태그 안에 코스가 다 담기고 나면 ul 태그 높이를 이용해 지도 높이를 계산함
getCourseListFetch().then(function() {// 다른 스크립트 실행
    const course_wrap = document.getElementById("course-wrap");
    const location_map = document.getElementById("location-map");
    const course_popup_bar = document.querySelector(".course-popup-bar")
    
    location_map.style.height = `calc(var(--vh, 1vh)*100 - 145px - ${course_wrap.clientHeight}px)`
    course_popup_bar.style.bottom = `calc(${course_wrap.clientHeight}px + 40px)`
    
    // 창 크기가 변함에 따라 코스 리스트가 들어있는 ul 태그의 크기도 변하므로 fixed 되어있는 팝업창 막대의 위치와 지도 크기가 변해야 함
    window.addEventListener('resize', () =>  { 
        location_map.style.height = `calc(var(--vh, 1vh)*100 - 145px - ${course_wrap.clientHeight}px)` 
        course_popup_bar.style.bottom = `calc(${course_wrap.clientHeight}px + 40px)`
    })

    // 팝업창 막대를 눌렀을 때 지도 크기가 변함
    course_popup_bar.addEventListener('click', () => {
        course_wrap.classList.toggle('hidden')
        course_popup_bar.style.bottom = `calc(${course_wrap.clientHeight}px + 40px)`
        location_map.style.height = `calc(var(--vh, 1vh)*100 - 145px - ${course_wrap.clientHeight}px)` 
    })
})

