import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import { ReloadOutlined } from '@ant-design/icons'

const getBaseUrl = () => localStorage.getItem('baseUrl') || 'http://localhost:8099'

const setBaseUrl = (url) => {
    localStorage.setItem('baseUrl', url)
}

const BaseUrlForm = () => {
    const [urlEditEnable, setValue] = useState(false)
    return (
        <Form
            initialValues={{ baseUrl: getBaseUrl() }}
            layout="inline"
            requiredMark={false}
            onFinish={values => {
                setBaseUrl(values.baseUrl)
                setValue(false)
            }}
            onValuesChange={(values) => setValue(values.baseUrl !== getBaseUrl())}>
            <Form.Item label='服务器地址：' name='baseUrl'
                rules={[{
                    required: true,
                    pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
                    message: '格式不对...',
                }]}>
                <Input style={{ width: 200 }} type='text' />
            </Form.Item>
            <Form.Item>
                {urlEditEnable && <Button shape='circle' icon={<ReloadOutlined />} type='primary'
                    htmlType='submit' />}
            </Form.Item>
        </Form>
    )
}
export { getBaseUrl, BaseUrlForm }