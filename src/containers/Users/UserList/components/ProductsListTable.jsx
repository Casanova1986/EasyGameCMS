/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { Button, Card, CardBody, Col, Row ,Modal,  Container,Table,ButtonToolbar,} from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import MagnifyIcon from 'mdi-react/MagnifyIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import CellphoneKeyIcon from 'mdi-react/CellphoneKeyIcon';
import DiamondStoneIcon from 'mdi-react/DiamondStoneIcon';
import CommentAlertOutlineIcon from 'mdi-react/CommentAlertOutlineIcon';
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import { Field, reduxForm,formValues  } from 'redux-form';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../../../../config/appConfig';
import renderCheckBoxField from '../../../../shared/components/form/CheckBox';
import renderRadioButtonField from '../../../../shared/components/form/RadioButton';
import Expand from '../../../../shared/components/Expand';
import classNames from 'classnames';
import Select from 'react-select';

const PhotoFormatter = ({ value }) => (
  <div className="products-list__img-wrap">
    <img src={value} alt="" />
  </div>
);

PhotoFormatter.propTypes = {
  value: PropTypes.string.isRequired,
};

const StatusFormatter = ({ value }) =>
  value === 'Active' ? (
    <span className="badge badge-success">Active</span>
  ) : (
    <span className="badge badge-danger">Baned</span>
  );

StatusFormatter.propTypes = {
  value: PropTypes.string.isRequired,
};

class ProductsListTable extends PureComponent {
  constructor() {
    super();

    this.toggle = this.toggle.bind(this)
    this.OnSearchClick = this.OnSearchClick.bind(this);

    this.state = {
      rows:[],// this.createRows(15),
      pageOfItems: [],
      UserId:"",
      DisplayName:"",
      UserCode:"",
      DeviceId:"",
      selectedIndexes: [],
      modal: false,
      banReason:"",
      banMode:0,
    };
  }

   onChangeValue = e =>{
    var data = {}
    data[e.target.name] = e.target.value;
    this.setState(data);
  }

onViewDataClick = e=>
{
  if(this.state.selectedIndexes.length > 0)
    {
     
      window.open(
        config.cms_url + `/user/getUserData?userID=` +this.state.selectedIndexes[0],
      '_blank'
    );
        
    }
}

  onBanClick = e =>{
    e.preventDefault();
    if(this.state.selectedIndexes.length > 0)
    {
      var msg = '';
      axios.post(config.base_url + config.url_BanListUser, {
        lsUser: this.state.selectedIndexes,
        banType:this.state.banMode,
        desc:this.state.banReason,
      })
      .then(function(response) {
        if(response.data.status ==='ok')
        {
          msg = 'banned success!'; 
          
        }
        else
        {
          msg = 'can not ban user';
        }
      
        console.log(response);
      }).then(()=>{
        this.setState({banReason:'',selectedIndexes:[],modal: false});
        window.alert(msg);
      });
    }
    else
  {
    window.alert('Chọn User cần ban');
  }

  }

  onSelectedChange = e =>{
    if(e && e.target)
    {
      if(e.target.checked)
      {
        this.state.selectedIndexes.push(e.target.name);
      }
      else
      {
        this.state.selectedIndexes.splice(this.state.selectedIndexes.indexOf(e.target.name),1);
      }

      console.log(this.state.selectedIndexes);
    }

  }

  onChangePage = pageOfItems => {
    // update state with new page of items
    this.setState({ pageOfItems });
  };

  getRandomDate = (start, end) =>
    new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    ).toLocaleDateString();

 
  onRowsSelected = rows => {
    console.log(rows);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.concat(
        rows.map(r => r.rowIdx)
      )
    });
  };

  onRowsDeselected = rows => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };

  OnSearchClick = e => {
    e.preventDefault();

var userList = [];

  axios.post(config.base_url + config.url_FindUser, {
    UserId: this.state.UserId.trim(),
    DisplayName:this.state.DisplayName.trim(),
    UserCode:this.state.UserCode.trim(),
    DeviceId:this.state.DeviceId.trim(),
    Coin:this.state.Coin,
    Gem:this.state.Gem,
    Level:this.state.Level,
  })
  .then(function(response) {
    console.log(response);
    if (response.status === 200) {
      let data = response.data;
      console.log('data', data);
      if (data.status === 'ok') {
        userList = data.data;
      }
    }
  })
  .catch(function(error) {
    console.log(error);
  })
  .then(() => {
   
    this.setState({
      rows:userList,
      selectedIndexes:[],
    },()=>{
      console.log(this.state.rows);
    })
  });

};

  OnClearClick = e => {
    e.preventDefault();

  this.setState({
  UserId:'',
  DisplayName:'',
  UserCode:'',
  DeviceId:'',

  });


  };

  OnkeyPress(e){


    if(e.which === 13){

      this.OnSearchClick(e);
    }
 }

  rowGetter = (i) => {
    const { rows } = this.state;
    return rows[i];
  };


  handleDateChange(date) {
    this.setState({
      startDate: date,
    });
  }

  handleTitleChange(event) {
    this.setState({
      banReason: event.target.value,
    });
  }
  handleDescriptionChange(event) {
    this.setState({
      banReason: event.target.value,
    });
  }
  toggle() {
    this.setState({ modal: false });
  }

  handleBanModeChange(event) {
    console.log(event.value);
    this.setState({
      banMode: event.value,
    });
  }

  render() {
    const { rows } = this.state;

    const banStyle = {

      backgroundColor: "#ffa500",

    };
    const modalClasses = classNames({
      'todo__add-modal': true,
    },);

    const BanModOption = [
      { value: '0', label: 'UnBan' },
      { value: '1', label: 'Ban' },
      { value: '2', label: 'Ban & Reset' },
      { value: '3', label: 'Ban Arena Only' },
      { value: '4', label: 'Reset Data Only' },
    ];
  

    return (
      <Col md={12} lg={12}>
        <Row>
        <Card>
          <CardBody>
          <div className="card__title">
              <h5 className="bold-text">Search User</h5>
              </div>
                <form className="form" >
                <Container>
                <Row>
                <Col md={6} xl={3}>
                   <div className="form__form-group-field">
                  <div className="form__form-group-icon">
                    <KeyVariantIcon />
                  </div>
                  <input name="UserId" 
                  value = {this.state.UserId}
                   placeholder="_id" 
                   onKeyPress={this.OnkeyPress}
                   onChange={this.onChangeValue} />
                </div>
                </Col>
                <Col md={6} xl={3}>
                   <div className="form__form-group-field">
                  <div className="form__form-group-icon">
                    <AccountOutlineIcon />
                  </div>
                  <input
                    name="DisplayName"
                    value = {this.state.DisplayName}
                    placeholder="DisplayName"
                   onKeyPress={this.OnkeyPress.bind(this)}
                    onChange={this.onChangeValue}
                  />
                </div>
                </Col>
                <Col md={6} xl={3}>
                   <div className="form__form-group-field">
                  <div className="form__form-group-icon">
                    <AccountOutlineIcon />
                  </div>
                  <input
                    name="UserCode"
                    value = {this.state.UserCode}
                    onChange={this.onChangeValue}
                   onKeyPress={this.OnkeyPress.bind(this)}
                    placeholder="UserCode"
                  />
                </div>
                </Col>
                <Col md={6} xl={3}>
                   <div className="form__form-group-field">
                  <div className="form__form-group-icon">
                    <CellphoneKeyIcon />
                  </div>
                  <input
                    name="DeviceId"
                    value = {this.state.DeviceId}
                    onChange={this.onChangeValue}
                   onKeyPress={this.OnkeyPress.bind(this)}
                    placeholder="DeviceId"
                  />
                </div>
                </Col>
                </Row>
               {/* <Row> <Label for="exampleEmail" sm={2}>Advance</Label></Row> */}
                {/* <Row >
                  <Col md={4} xl={4} className="form--horizontal">
                  <div className="form__form-group">
                <span className="form__form-group-label"></span>
                <div className="form__form-group-field">
                <Label for="exampleEmail" sm={2}>Gem</Label>
                <select className="select-options">
                <option value="1">Lớn hơn</option>
                <option value="-1">Nhỏ hơn</option>
                <option value="0">Bằng</option>
              </select>
                  <div className="form__form-group-icon">
                    <DiamondStoneIcon />
                  </div>
                  <Field
                    name="gem"
                    component="input"
                    type="text"
                    placeholder="Gem"
                  />
                </div>
              </div> </Col>
              <Col md={4} xl={4} className="form--horizontal">
                  <div className="form__form-group">
                <span className="form__form-group-label"></span>
                <div className="form__form-group-field">
                <Label for="exampleEmail" sm={2}>Coin</Label>
                <select className="select-options">
                <option value="1">Lớn hơn</option>
                <option value="-1">Nhỏ hơn</option>
                <option value="0">Bằng</option>
              </select>
                  <div className="form__form-group-icon">
                    <DiamondStoneIcon />
                  </div>
                  <Field
                    name="coin"
                    component="input"
                    type="text"
                    placeholder="Coin"
                  />
                </div>
              </div> </Col>
              <Col md={4} xl={4} className="form--horizontal">
                  <div className="form__form-group">
                <span className="form__form-group-label"></span>
                <div className="form__form-group-field">
                <Label for="exampleEmail" sm={2}>Dragon</Label>
                <select className="select-options">
                <option value="1">Lớn hơn</option>
                <option value="-1">Nhỏ hơn</option>
                <option value="0">Bằng</option>
              </select>
                  <div className="form__form-group-icon">
                    <DiamondStoneIcon />
                  </div>
                  <Field
                    name="level"
                    component="input"
                    type="text"
                    placeholder="DragonLevel"
                  />
                </div>
              </div> </Col>

                </Row>*/}
                <div className="card__title"/>
                </Container> 
                <Button className="icon" color="success" onClick={e => this.OnSearchClick(e)}><p> <MagnifyIcon /> Search</p></Button>
                <Button className="icon" color="warning" onClick={e => this.OnClearClick(e)}><p><CloseCircleOutlineIcon /> Clear</p></Button>
                </form>
          </CardBody>
        </Card>
        </Row>
        <Row>  <Card>
          <CardBody className="products-list">
            <div className="card__title">
              <h5 className="bold-text">User List</h5>
              <div style={{float: 'right'}}>
              <Expand title="View"  color="primary" handleClick={e => this.onViewDataClick(e)}/>
              <Expand title="Ban"  style={banStyle} handleClick={()=> {
                this.setState({modal:true});
              }} />
              
              <Expand  color="danger" title="Delete" /></div>
              
            </div>
            <p className="typography-message">
              Show
              <select className="select-options">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              entries
            </p>
            <div className="table">
        {/* <ReactDataGrid
          // onGridSort={this.handleGridSort}
          rowKey="_id"
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              indexes: this.state.selectedIndexes
            }
          }}
          columns={this.heads}
          rowGetter={this.rowGetter}
          rowsCount={rows.length}
          rowHeight={44}
          minColumnWidth={100}
        /> */}
          <Table responsive className="table--bordered dashboard__table-crypto">
      <thead>
        <tr>
          <th>#</th>
          <th>_id</th>
          <th>UserCode</th>
          <th>DataVersion</th>
          <th>DisplayName</th>
          <th>Version</th>
          <th>FirstVersion</th>
          <th>MaxStage</th>
          <th>Gem</th>
          <th>Coin</th>
          <th>Stone</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((crypto, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
           
            <td dir="ltr">{crypto._id}</td>
            <td dir="ltr">{crypto.UserCode}</td>
            <td dir="ltr">{crypto.DataVersion}</td>
            <td dir="ltr">{crypto.DisplayName}</td>
            <td dir="ltr">{crypto.Version}</td>
            <td dir="ltr">{crypto.FirstVerSion}</td>
            <td dir="ltr">{crypto.MaxStage}</td>
            <td>{crypto.Gem}</td>
            <td>{crypto.Coin}</td>
            <td>{crypto.Stone}</td>
            <td>{StatusFormatter('Active')}</td>
            <td>
            <Field
                  name={crypto._id}
                  id={index}
                  component={renderCheckBoxField}
                  className="colored-click"
                  onChange = {this.onSelectedChange}
                />
              {/* <input
          className="checkbox-btn__checkbox"
          type="checkbox"
          id={crypto._id}
          name={index}
          onChange={this.onSelectedChange}
          checked = 'false'
        /> */}
        </td>
            {/* <td className="dashboard__table-crypto-chart">
              <ResponsiveContainer height={36}>
                <AreaChart data={data} margin={{ top: 0, left: 0, bottom: 0 }}>
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={crypto.chart}
                    fill="#4ce1b6"
                    stroke="#4ce1b6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </td> */}
            {/* <td>
              <DropDownMore index={index} handleDeleteRow={e => onDeleteCryptoTableData(index, e)} />
            </td> */}
          </tr>
        ))}
      </tbody>
    </Table>
 
      </div>
            {/* <EditTable heads={this.heads} rows={this.state.rows} enableRowSelect /> */}
          </CardBody>
        </Card>
     </Row>
     <Modal
          isOpen = {this.state.modal} 
          toggle= {this.toggle}
          className={modalClasses}
        >
          <div className="form">
            {/* <div className="form__form-group">
              <span className="form__form-group-label typography-message">Title</span>
              <div className="form__form-group-field">
                <input
                  type="text"
                  placeholder="title.."
                  required
                  value={this.state.banReason}
                  onChange={this.handleTitleChange.bind(this)}
                />
              </div>
            </div> */}

            <div className="form__form-group">
              <span className="form__form-group-label">Lý do ban</span>
              <div className="form__form-group-field">
                <textarea
                  placeholder="Description"
                  required
                  value={this.state.banReason}
                  onChange={this.handleDescriptionChange.bind(this)}
                /> 
              </div>

              {/* <div className="form__form-group">
              <div className="form__form-group-field">
              <Field
                  name="rdBan"
                  component={renderRadioButtonField}
                  className="colored"
                  radioValue="1"
                  defaultChecked
                  label="Ban"
                  onChange = {this.onSelectedChange}
                />
                 <Field
                  name="rdClear"
                  component={renderRadioButtonField}
                  className="colored"
                  radioValue="2"
                  label="Ban & Clear"
                  onChange = {this.onSelectedChange}
                />
                  <Field
                  name="rdArenaBan"
                  component={renderRadioButtonField}
                  className="colored"
                  radioValue="2"
                  label="Ban Arena Only"
                  onChange = {this.onSelectedChange}
                />
                 <Field
                  name="rdClearData"
                  component={renderRadioButtonField}
                  className="colored"
                  radioValue="2"
                  label="Clear Data Only"
                  onChange = {this.onSelectedChange}
                />
              </div>
              </div> */}

            </div>

            {/* <div className="form__form-group">
              <span className="form__form-group-label">Due Date</span>
              <div className="form__form-group-field priority">
                {/* <DatePicker
                  dateFormat="yyyy/MM/dd"
                  selected={startDate}
                  onChange={this.handleDateChange}
                />
              </div>
            </div> */}

            <div className="form__form-group">
              <span className="form__form-group-label"></span>
              <div className="form__form-group-field priority">
                <Select
                  options={BanModOption}
                  onChange={this.handleBanModeChange.bind(this)}
                  defaultValue="Select Action..."
                /> 
              </div>
            </div> 


            <ButtonToolbar className="form__button-toolbar">
              <Button color="primary" type="submit" onClick={this.onBanClick}>Ban</Button>
              <Button type="button" onClick={this.toggle}>Cancel</Button>
            </ButtonToolbar>
          </div>
        </Modal>
     
      </Col>
  
    );
  }
}


export default reduxForm({
  form: 'user-search-form', // a unique identifier for this form
})(withTranslation('common')(ProductsListTable));
