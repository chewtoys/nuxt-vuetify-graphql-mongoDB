
<template>
  <v-app>
    <v-container fluid fill-height class="loginOverlay">
      <v-layout flex align-center justify-center>
        <v-flex xs12 sm4 elevation-6>
          <v-toolbar class="pt-5 blue darken-4">
            <v-toolbar-title class="white--text">
              <h4>Welcome Back</h4>
            </v-toolbar-title>
          </v-toolbar>
          <v-card>
            <v-card-text class="pt-4">
              <div>
                <nuxt/>
              </div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>
