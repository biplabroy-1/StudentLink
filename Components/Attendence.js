import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress';

function Attendence() {

    const [attendancePercentage, setAttendancePercentage] = useState('');
    const [upcomingPayment, setUpcomingPayment] = useState('');
    const [numberOfActivities, setNumberOfActivities] = useState('');
    const [sgpa, setSgpa] = useState('');
    const [courseAttendance, setCourseAttendance] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://www.brainwareuniversity.ac.in/studentselfservice/index.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'student_code=BWU/BCA/23/783&password=your_password&login=Login',
                });

                const text = await response.text();
                if (text.includes('window.location=')) {
                    const scriptContent = text.split("window.location='")[1].split("'")[0];
                    const fullRedirectionUrl = `https://www.brainwareuniversity.ac.in/studentselfservice/${scriptContent}`;

                    const redirectionResponse = await fetch(fullRedirectionUrl);
                    const targetResponse = await fetch('https://www.brainwareuniversity.ac.in/studentselfservice/student-how-to-use.php');
                    const targetText = await targetResponse.text();

                    // Extracting attendance percentage
                    const attendancePercentageMatch = targetText.match(/<h3>(.*?)<sup/);
                    if (attendancePercentageMatch) {
                        setAttendancePercentage(attendancePercentageMatch[1]);
                    }

                    // Extracting upcoming payment details
                    const upcomingPaymentMatch = targetText.match(/<h3 class="" style="font-size:34px !important;">(.*?)<\/h3>\s*<p>(.*?)<\/p>/);
                    if (upcomingPaymentMatch) {
                        setUpcomingPayment(`${upcomingPaymentMatch[1]} ${upcomingPaymentMatch[2]}`);
                    }

                    // Extracting number of activities
                    const numberOfActivitiesMatch = targetText.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g);
                    if (numberOfActivitiesMatch && numberOfActivitiesMatch.length > 1) {
                        const activitiesText = numberOfActivitiesMatch[1].match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/);
                        setNumberOfActivities(activitiesText[1]);
                    }

                    // Extracting SGPA
                    const sgpaMatch = targetText.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g);
                    if (sgpaMatch && sgpaMatch.length > 2) {
                        const sgpaText = sgpaMatch[2].match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/);
                        setSgpa(sgpaText[1]);
                    }

                    // Extracting course-wise attendance
                    const courseAttendanceTable = targetText.match(/<table class="table">([\s\S]*?)<\/table>/g);
                    if (courseAttendanceTable) {
                        const courses = [];
                        const rows = courseAttendanceTable[1].match(/<tr>[\s\S]*?<\/tr>/g);
                        rows.forEach(row => {
                            const columns = row.match(/<td>(.*?)<\/td>/g).map(col => col.replace(/<\/?td>/g, ''));
                            courses.push({
                                courseCode: columns[0],
                                courseName: columns[1],
                                attendance: columns[2],
                                percentage: columns[3],
                            });
                        });
                        setCourseAttendance(courses);
                    }
                } else {
                    console.log('Login failed: Incorrect login details or redirection script not found.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <View className="mt-4 px-4">
            <Text className="text-xl font-semibold">Attendance</Text>
            <View className="bg-teal-100 p-4 rounded-lg mt-2">
                <View className='flex-row justify-between items-center'>
                    <Text className="text-lg font-semibold">Subjects</Text>
                    <Text className="text-xs mt-2">Oct - Sep 2023</Text>
                </View>
                <View className='mt-2 flex-row justify-between items-center'>
                    <View className="">
                        {courseAttendance.map((item, index) => (
                            <Text key={index} className="text-base my-1">
                                {item.courseCode} - ({item.attendance}) {item.percentage}%
                            </Text>
                        ))}
                    </View>
                    <View className='items-center '>
                        <Progress.Pie size={130} progress={attendancePercentage / 100} thickness={10} color={attendancePercentage <= 40 ? 'red' : '' || attendancePercentage >= 80 ? 'green' : 'blue'} showsText='true' />
                        <Text className={`text-3xl mt-4 font-bold ${attendancePercentage <= 40 ? ' text-red-700' : '' || attendancePercentage >= 80 ? 'text-green-700' : 'text-blue-700'}`}>{attendancePercentage} %</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default Attendence;
