import React from 'react';
import { Card, Input, Typography } from 'antd';

const { Title } = Typography;

interface UserInformationProps {
  userInfo: {
    userName: string;
    isActive: boolean;
    role: string;
    loginCount: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const UserInformation: React.FC<UserInformationProps> = ({ userInfo }) => {
  const inputStyle = {
    color: 'rgba(0, 0, 0, 0.6)'
  };

  return (
    <div className="pt-2 pr-6 pl-6">
      <Title level={4}>Your user information</Title>
      
      <Card 
        title="User Info" 
        className="mb-6"
        headStyle={{
          fontSize: '1.25rem',
          fontWeight: 700
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-1">User Name :</label>
            <Input 
              disabled 
              value={userInfo.userName}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
          
          <div className='mt-1'>
            <label className="block text-lg mb-1 font-semibold">Is Active :</label>
            <Input 
              disabled 
              value={userInfo.isActive ? 'True' : 'False'}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
          
          <div className='mt-1'>
            <label className="block text-lg font-semibold mb-1">Role :</label>
            <Input 
              disabled 
              value={userInfo.role}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
        </div>
      </Card>

      <Card 
        title="Personal Info"
        headStyle={{
          fontSize: '1.25rem',
          fontWeight: 700
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-lg mb-1 font-semibold">First Name :</label>
            <Input 
              disabled 
              value={userInfo.firstName}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
          
          <div className='mt-1'>
            <label className="block text-lg mb-1 font-semibold">Last Name :</label>
            <Input 
              disabled 
              value={userInfo.lastName}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
          
          <div className='mt-1'>
            <label className="block text-lg font-semibold mb-1">Email :</label>
            <Input 
              disabled 
              value={userInfo.email}
              className="max-w-md text-lg font-semibold"
              style={inputStyle}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserInformation; 