import React, { Component } from 'react';
import axios from "axios";
import { Divider, Button, message, Select, Table, Tag, Upload, Radio } from "antd";
import { InboxOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Dragger } = Upload;
const columns = [
    {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: '班次',
        dataIndex: 'classNum',
        key: 'classNum',
    }, {
        title: '上班打卡',
        dataIndex: 'startTime',
        key: 'startTime',
        render: startTime => (
            <span>
                <Tag color='geekblue' key={startTime[0]}>
                    {startTime[0]}
                </Tag>
                <Tag
                    key={startTime[1]}
                    icon={startTime[1] === '正常' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    color={startTime[1] === '正常' ? 'success' : 'warning'} >
                    {startTime[1]}
                </Tag>
            </span>
        ),
    }, {
        title: '下班打卡',
        dataIndex: 'endTime',
        key: 'endTime',
        render: endTime =>
            <span>
                <Tag color='geekblue' key={endTime[0]}>
                    {endTime[0]}
                </Tag>
                <Tag
                    key={endTime[1]}
                    icon={endTime[1] === '正常' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    color={endTime[1] === '正常' ? 'success' : 'warning'} >
                    {endTime[1]}
                </Tag>
            </span>
    }, {
        title: '加班时长',
        dataIndex: 'jiaBan',
        key: 'jiaBan',
        render: jiaBan => jiaBan === null ? '' : <Tag color='red'>{jiaBan}</Tag>
    }, {
        title: '解释',
        dataIndex: 'desc',
        key: 'desc',
    },
];

const radioOptions = [
    { label: '全部数据', value: 1 },
    { label: '只看正常', value: 2 },
    { label: '只看异常', value: 3 },
    { label: '只看有加班', value: 4 },]

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName: 'all',
            filterType: 1,
            allList: [],
            list: [],
            names: []
        }
    }

    getInfo = () => {
        this.setState({
            loading: true
        })
        axios.get('http://localhost:8080/api/v1/info').then((response) => {
            if (response.data.code === '10000') {
                const { filterName, filterType } = this.state
                let sourceList = response.data.data
                let allList = []
                let nameSet = new Set()
                sourceList.map((item, index) => {
                    allList.push({
                        key: index,
                        name: item.name,
                        classNum: item.classNum,
                        date: item.date,
                        startTime: [item.startTime1, item.startResult1],
                        endTime: [item.endTime1, item.endResult1],
                        jiaBan: item.jiaBan,
                        desc: item.desc,
                    })
                    item.name && nameSet.add(item.name)
                })
                let list = allList
                let newFilterName = filterName
                if (nameSet.has(newFilterName)) {
                    list = list.filter(item => item.name === newFilterName)
                } else {
                    newFilterName = 'all'//刷新之后找不到已选的姓名
                }
                if (filterType === 2) {
                    list = list.filter(item => item.startTime[1] === '正常' && item.endTime[1] === '正常')
                } else if (filterType === 3) {
                    list = list.filter(item => item.startTime[1] !== '正常' || item.endTime[1] !== '正常')
                } else if (filterType === 4) {
                    list = list.filter(item => item.jiaBan !== null)
                }
                this.setState({
                    loading: false,
                    allList: allList,
                    list: list,
                    filterName: filterName,
                    names: Array.from(nameSet),
                })
            } else {
                this.setState({
                    loading: false,
                })
            }
        }).catch((response) => {
            this.setState({
                loading: false,
            })
        })
    }
    handleUploaderChange = (info) => {
        // if (info.file.status !== 'uploading') {
        //     console.log(info.file, info.fileList);
        // }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            this.getInfo()
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }
    onSelectChange = value => {
        this.setState({
            filterName: value,
            list: this.doFilter(value, this.state.filterType)
        })
    }
    onRadioChange = value => {
        this.setState({
            filterType: value.target.value,
            list: this.doFilter(this.state.filterName, value.target.value)
        })
    }
    doFilter = (filterName, filterType) => {
        let list = filterName === 'all' ? this.state.allList : this.state.allList.filter(item => item.name === filterName)//过滤姓名
        if (filterType === 2) {
            list = list.filter(item => item.startTime[1] === '正常' && item.endTime[1] === '正常')
        } else if (filterType === 3) {
            list = list.filter(item => item.startTime[1] !== '正常' || item.endTime[1] !== '正常')
        } else if (filterType === 4) {
            list = list.filter(item => item.jiaBan !== null)
        }
        return list
    }
    componentDidMount() {
        this.getInfo()
    }

    render() {
        const uploadProps = {
            name: 'file',
            action: 'http://localhost:8080/api/v1/upload/excel',
            maxCount: [1],
            progress: {
                strokeColor: {
                    '0%': '#108ee9',
                    '100%': '#87d068',
                },
                strokeWidth: 3,
                format: percent => `${parseFloat(percent.toFixed(2))}%`,
            },

        }
        const { loading, filterName, filterType, list, names } = this.state
        return <div className='main'>
            <div className='uploadFile'>
                <Dragger {...uploadProps} onChange={this.handleUploaderChange}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或者拖拽Excel文件到这里</p>
                </Dragger>
            </div>
            <Divider />
            <Select defaultValue={filterName} style={{ width: 120 }} onChange={this.onSelectChange}>
                <Option value="all">全部员工</Option>
                {names.map(name => (<Option key={name} value={name}>{name}</Option>))}
            </Select>
            <Radio.Group
                style={{ marginLeft: 20 }}
                onChange={this.onRadioChange}
                options={radioOptions}
                value={filterType}
                optionType="button"
                buttonStyle="solid"
            />
            <Button style={{ marginLeft: 20 }} loading={loading} type='primary' shape='circle' icon={<SyncOutlined />} onClick={this.getInfo} />
            <Divider />
            <Table
                dataSource={list}
                columns={columns}
                bordered
            />
        </div>
    }
}

export default Main
