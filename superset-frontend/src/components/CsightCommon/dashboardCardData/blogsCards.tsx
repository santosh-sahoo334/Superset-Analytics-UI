/* eslint-disable */
// @ts-nocheck
import { ArrowRightOutlined, EditOutlined } from '@ant-design/icons';
import { Card } from 'primereact/card';
import LoadingSpinner from '../LoadingSpinner';
import React, { useEffect, useState, useRef } from 'react';

export const BlogsCard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const openDocument = (url) => {
    window.open(url, "_blank"); // Open document in a new tab
  };
  return (
    <Card title="" className="w-full h-full relative">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="flex justify-start title-card gap-2 p-2 title-color">
            <EditOutlined className="text-xl" />
            <span className="text-2xl font-medium">Blogs</span>
          </div>
          <div>
                <div className="flex mb-3">
                  <img
                    src={'/static/assets/images/blog.png'}
                    alt="blog"
                    width={175}
                    height={100}
                    className="p-1 w-1/4"
                  />
                  <div className="blog-details pl-2">
                    <p className="text-lg text-bold start-text m-0">
                    Focus - Data Model
                    </p>
                    {/* <p className="text-sm start-text m-0">
                      Lorem ipsum dolor sit amet consectetur.
                    </p> */}
                    <button className="text-lg start-text read-button border-none bg-none m-0 pl-0" onClick={()=>{openDocument(
                  "https://www.teksecur.com/blog/understanding-focus-datasets-in-finops-a-foundation-for-cloud-financial-excellence"
                )}}>
                      Read More <ArrowRightOutlined className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex mb-3">
                  <img
                    src={'/static/assets/images/blog2.png'}
                    alt="blog"
                    width={175}
                    height={100}
                    className="p-1 w-1/4"
                  />
                  <div className="blog-details pl-2">
                    <p className="text-lg text-bold start-text m-0">
                    Unit Economics
                    </p>
                    {/* <p className="text-sm start-text m-0">
                      Lorem ipsum dolor sit amet consectetur.
                    </p> */}
                    <button className="text-lg start-text read-button border-none bg-none m-0 pl-0" onClick={()=>{openDocument(
                  "https://www.teksecur.com/blog/unit-economics-in-finops-measuring-cloud-value"
                )}}>
                      Read More <ArrowRightOutlined className="text-xl" />
                    </button>
                  </div>
                </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default BlogsCard;
