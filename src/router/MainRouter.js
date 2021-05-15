import React, { useEffect } from "react";
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NavBar from '../components/Navbar';
import HomeScreen from '../screens/HomeScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import { useDispatch, useSelector } from 'react-redux';

import { getToken } from '../http/localStorage'
import { startGetMe } from '../redux/actions/user'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import { FiUnlock } from "react-icons/fi";



export default function MainRouter() {
    const dispatch = useDispatch()

    const PrivateRoute = ({component}) => {
        const user = useSelector( (store) => store.user )

        if (user.isAuthenticated){
          return component
        }
       
        return <Redirect to="/" />
      }
      

    return (
        <>
        <Router>  
           <NavBar />
           <Switch>
                {/* Public routes */}
                <Route path="/" exact>
                    <HomeScreen />
                </Route>
                <Route path="/test" exact>
                    
                </Route>
                <Route path="/signup">
                    <SignupScreen />
                </Route>
                <Route path="/login">
                    <LoginScreen />
                </Route>
                {/* Private routes */}
                <Route path="/settings">
                    <PrivateRoute component={<SettingsScreen />} />
                </Route>
                <Route path="/profile">
                    <PrivateRoute component={<ProfileScreen />} />
                </Route>
                {/* <Route 
                    exact={true}
                    path="/barber/:id" 
                    component={ProfileScreen}
                /> */}
            </Switch>
        </Router>
        </>
    )
}